export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuthorizationService } from '@/lib/authorization/service';
import { APPLICATION } from '@/lib/permissions/constants';
import { Prisma } from '@prisma/client';
import { errorToResponse, NotFoundError, ValidationError } from '@/lib/errors';
import { getPaginationParams, parseBody } from '@/lib/api-utils';
import { createApplicationSchema } from '@/lib/validations/application';
import { AuditService } from '@/lib/services/audit.service';
import { NotificationService, NOTIFICATION_TYPES } from '@/lib/services/notification.service';
import { MatchService } from '@/lib/services/match.service';
import { EventPublisher } from '@/lib/events/publisher';
import { SUBJECTS } from '@/lib/events/types';
import { enqueueJob, EMAIL_JOB_TYPES } from '@/lib/jobs';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { page, limit, skip } = getPaginationParams(req);
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = { deletedAt: null };

    // Check if user is employer viewing applications for their jobs
    const canViewOwnJobs = await AuthorizationService.can(
      { id: session.user.id },
      APPLICATION.VIEW_OWN_JOBS
    );

    const canViewMetrics = await AuthorizationService.can(
      { id: session.user.id },
      APPLICATION.VIEW_METRICS
    );

    if (canViewMetrics) {
      // BD/Admin: can see all
      if (jobId) where.jobId = jobId;
    } else if (canViewOwnJobs) {
      // Employer: see applications for own jobs
      const member = await prisma.member.findFirst({
        where: { userId: session.user.id, employerId: { not: null } },
      });
      if (member?.employerId) {
        where.employerId = member.employerId;
        if (jobId) where.jobId = jobId;
      } else {
        return NextResponse.json({ data: [], pagination: { total: 0, page, limit, totalPages: 0 } });
      }
    } else {
      // Student: own applications only
      const profile = await prisma.studentProfile.findUnique({
        where: { userId: session.user.id },
      });
      if (profile) {
        where.profileId = profile.id;
      } else {
        return NextResponse.json({ data: [], pagination: { total: 0, page, limit, totalPages: 0 } });
      }
    }

    if (status) where.status = status;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          job: {
            select: { id: true, title: true, domain: true, type: true, employerId: true },
          },
          employer: {
            select: { id: true, companyName: true },
          },
          profile: {
            select: { id: true, anonymizedId: true, displayName: true },
          },
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return NextResponse.json({
      data: applications,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await AuthorizationService.authorize({ id: session.user.id }, APPLICATION.CREATE);

    const body = await parseBody(req, createApplicationSchema);

    // Get student profile
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) {
      throw new ValidationError('Student profile not found. Complete your profile first.');
    }

    // Get job
    const job = await prisma.job.findUnique({
      where: { id: body.jobId, deletedAt: null },
      include: { employer: { select: { id: true, companyName: true } } },
    });
    if (!job) throw new NotFoundError('Job', body.jobId);
    if (job.status !== 'ACTIVE') {
      throw new ValidationError('Job is not accepting applications');
    }

    // Check for duplicate application
    const existing = await prisma.application.findFirst({
      where: {
        jobId: body.jobId,
        profileId: profile.id,
        deletedAt: null,
        status: { notIn: ['WITHDRAWN', 'REJECTED'] },
      },
    });
    if (existing) {
      throw new ValidationError('You have already applied to this job');
    }

    // Try to get match score
    let matchScore: number | null = null;
    try {
      const match = await MatchService.getOrComputeMatchScore(body.jobId, profile.id);
      matchScore = Number(match.overallScore);
    } catch {
      // Match scoring is advisory, don't block application
    }

    const application = await prisma.application.create({
      data: {
        jobId: body.jobId,
        profileId: profile.id,
        employerId: job.employerId,
        coverLetter: body.coverLetter,
        customAnswers: (body.customAnswers as Prisma.InputJsonValue) ?? undefined,
        matchScoreAtApply: matchScore,
        statusHistory: JSON.stringify([
          { status: 'SUBMITTED', changedBy: session.user.id, changedAt: new Date().toISOString() },
        ]) as unknown as Prisma.InputJsonValue,
      },
      include: {
        job: { select: { title: true } },
        employer: { select: { companyName: true } },
      },
    });

    // Audit
    await AuditService.log({
      eventType: 'application.submitted',
      entityType: 'Application',
      entityId: application.id,
      actorUserId: session.user.id,
      afterState: { jobId: body.jobId, profileId: profile.id, status: 'SUBMITTED' },
    });

    // Notification
    await NotificationService.create({
      type: NOTIFICATION_TYPES.APPLICATION_SUBMITTED,
      title: 'New application received',
      message: `New application for "${application.job.title}"`,
      userId: session.user.id,
      metadata: { applicationId: application.id, jobId: body.jobId },
    });

    // Email (async)
    if (profile.email) {
      await enqueueJob(EMAIL_JOB_TYPES.APPLICATION_CONFIRMATION, {
        studentEmail: profile.email,
        studentName: profile.displayName || 'Student',
        jobTitle: application.job.title,
        companyName: application.employer.companyName,
        applicationId: application.id,
      });
    }

    // Publish event (fire and forget)
    EventPublisher.publish(
      SUBJECTS.TALENT_APPLICATION_SUBMITTED,
      {
        applicationId: application.id,
        jobId: body.jobId,
        profileId: profile.id,
        userId: session.user.id,
        employerId: job.employerId,
        matchScore,
        submittedAt: application.submittedAt.toISOString(),
      },
      {
        entityType: 'Application',
        entityId: application.id,
        actorUserId: session.user.id,
      }
    ).catch(() => {});

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}
