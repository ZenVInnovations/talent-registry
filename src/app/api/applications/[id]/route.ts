export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuthorizationService } from '@/lib/authorization/service';
import { APPLICATION } from '@/lib/permissions/constants';
import { errorToResponse, NotFoundError, ValidationError } from '@/lib/errors';
import { parseBody } from '@/lib/api-utils';
import { updateApplicationStatusSchema } from '@/lib/validations/application';
import { AuditService } from '@/lib/services/audit.service';
import { NotificationService } from '@/lib/services/notification.service';
import { EventPublisher } from '@/lib/events/publisher';
import { SUBJECTS } from '@/lib/events/types';
import { ApplicationStatus } from '@/types';

// Valid status transitions
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ['UNDER_REVIEW', 'REJECTED', 'WITHDRAWN'],
  UNDER_REVIEW: ['SCREENING_REQUESTED', 'SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
  SCREENING_REQUESTED: ['SCREENING_COMPLETED', 'WITHDRAWN'],
  SCREENING_COMPLETED: ['SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
  SHORTLISTED: ['INTERVIEW_SCHEDULED', 'OFFERED', 'REJECTED', 'WITHDRAWN'],
  INTERVIEW_SCHEDULED: ['OFFERED', 'REJECTED', 'WITHDRAWN'],
  OFFERED: ['ACCEPTED', 'DECLINED_BY_STUDENT', 'WITHDRAWN'],
  ACCEPTED: [],
  DECLINED_BY_STUDENT: [],
  REJECTED: [],
  WITHDRAWN: [],
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const application = await prisma.application.findUnique({
      where: { id, deletedAt: null },
      include: {
        job: {
          select: {
            id: true, title: true, domain: true, type: true,
            employer: { select: { id: true, companyName: true } },
          },
        },
        profile: {
          select: { id: true, anonymizedId: true, displayName: true, userId: true },
        },
        placement: true,
      },
    });

    if (!application) throw new NotFoundError('Application', id);

    // Check access: student (own), employer (own jobs), BD/admin (all)
    const isStudent = application.profile.userId === session.user.id;
    const isEmployer = await prisma.member.findFirst({
      where: { userId: session.user.id, employerId: application.employerId },
    });
    const canViewMetrics = await AuthorizationService.can(
      { id: session.user.id },
      APPLICATION.VIEW_METRICS
    );

    if (!isStudent && !isEmployer && !canViewMetrics) {
      throw new NotFoundError('Application', id);
    }

    return NextResponse.json(application);
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await parseBody(req, updateApplicationStatusSchema);

    const application = await prisma.application.findUnique({
      where: { id, deletedAt: null },
      include: {
        profile: { select: { userId: true } },
        job: { select: { title: true } },
        employer: { select: { companyName: true } },
      },
    });

    if (!application) throw new NotFoundError('Application', id);

    const previousStatus = application.status as ApplicationStatus;
    const newStatus = body.status as ApplicationStatus;

    // Validate transition
    const allowed = ALLOWED_TRANSITIONS[previousStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new ValidationError(
        `Cannot transition from ${previousStatus} to ${newStatus}`
      );
    }

    // Permission checks based on action
    const isStudent = application.profile.userId === session.user.id;
    const isEmployer = await prisma.member.findFirst({
      where: { userId: session.user.id, employerId: application.employerId },
    });

    if (newStatus === 'WITHDRAWN') {
      if (!isStudent) {
        throw new ValidationError('Only the applicant can withdraw');
      }
      await AuthorizationService.authorize(
        { id: session.user.id },
        APPLICATION.WITHDRAW_OWN
      );
    } else if (newStatus === 'DECLINED_BY_STUDENT' || newStatus === 'ACCEPTED') {
      if (!isStudent) {
        throw new ValidationError('Only the applicant can accept or decline');
      }
    } else if (['SHORTLISTED', 'INTERVIEW_SCHEDULED'].includes(newStatus)) {
      if (!isEmployer) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      await AuthorizationService.authorize(
        { id: session.user.id },
        APPLICATION.SHORTLIST,
        { employerId: application.employerId }
      );
    } else if (newStatus === 'OFFERED') {
      if (!isEmployer) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      await AuthorizationService.authorize(
        { id: session.user.id },
        APPLICATION.OFFER,
        { employerId: application.employerId }
      );
    } else if (newStatus === 'REJECTED') {
      if (!isEmployer) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      await AuthorizationService.authorize(
        { id: session.user.id },
        APPLICATION.REJECT,
        { employerId: application.employerId }
      );
    }

    // Parse existing history and append
    let history: unknown[];
    try {
      history = typeof application.statusHistory === 'string'
        ? JSON.parse(application.statusHistory)
        : (application.statusHistory as unknown[]) || [];
    } catch {
      history = [];
    }

    history.push({
      status: newStatus,
      changedBy: session.user.id,
      changedAt: new Date().toISOString(),
      reason: body.reason,
    });

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: newStatus,
        statusHistory: JSON.stringify(history),
      },
    });

    // Audit
    await AuditService.log({
      eventType: 'application.status_changed',
      entityType: 'Application',
      entityId: id,
      actorUserId: session.user.id,
      beforeState: { status: previousStatus },
      afterState: { status: newStatus, reason: body.reason },
    });

    // Notifications
    await NotificationService.notifyApplicationStatusChange(
      id,
      previousStatus,
      newStatus,
      session.user.id
    );

    // Publish event
    EventPublisher.publish(
      SUBJECTS.TALENT_APPLICATION_STATUS_CHANGED,
      {
        applicationId: id,
        jobId: application.jobId,
        userId: application.profile.userId,
        employerId: application.employerId,
        previousStatus,
        newStatus,
        changedBy: session.user.id,
        changedAt: new Date().toISOString(),
      },
      {
        entityType: 'Application',
        entityId: id,
        actorUserId: session.user.id,
      }
    ).catch(() => {});

    return NextResponse.json(updated);
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}
