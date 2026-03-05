export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuthorizationService } from '@/lib/authorization/service';
import { JOB, TALENT } from '@/lib/permissions/constants';
import { errorToResponse } from '@/lib/errors';
import { getPaginationParams, parseBody } from '@/lib/api-utils';
import { createJobSchema } from '@/lib/validations/job';
import { AuditService } from '@/lib/services/audit.service';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { page, limit, skip } = getPaginationParams(req);
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const employerId = searchParams.get('employerId');
    const search = searchParams.get('search');

    const canViewAll = await AuthorizationService.can(
      { id: session.user.id },
      JOB.VIEW_ALL
    );

    const where: Record<string, unknown> = { deletedAt: null };

    if (!canViewAll) {
      // Students/employers see only ACTIVE jobs (or their own)
      const canBrowse = await AuthorizationService.can(
        { id: session.user.id },
        TALENT.BROWSE
      );

      if (canBrowse) {
        // Employer: see own jobs in any status + active jobs
        const employerMember = await prisma.member.findFirst({
          where: { userId: session.user.id, employerId: { not: null } },
        });
        if (employerMember?.employerId) {
          where.OR = [
            { employerId: employerMember.employerId },
            { status: 'ACTIVE' },
          ];
        } else {
          where.status = 'ACTIVE';
        }
      } else {
        // Student: only active jobs
        where.status = 'ACTIVE';
      }
    }

    if (domain) where.domain = domain;
    if (type) where.type = type;
    if (status && canViewAll) where.status = status;
    if (employerId) where.employerId = employerId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          employer: {
            select: { id: true, companyName: true, companySector: true, logoUrl: true },
          },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      data: jobs,
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

    // Find employer membership
    const member = await prisma.member.findFirst({
      where: { userId: session.user.id, employerId: { not: null } },
      include: { employer: true },
    });

    if (!member?.employerId || !member.employer) {
      return NextResponse.json({ error: 'Not associated with an employer' }, { status: 403 });
    }

    // Check employer is verified
    if (member.employer.verificationStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Employer must be verified before posting jobs' },
        { status: 403 }
      );
    }

    await AuthorizationService.authorize(
      { id: session.user.id },
      JOB.CREATE,
      { employerId: member.employerId }
    );

    const body = await parseBody(req, createJobSchema);

    const job = await prisma.job.create({
      data: {
        ...body,
        employerId: member.employerId,
        closesAt: body.closesAt ? new Date(body.closesAt) : undefined,
        status: 'DRAFT',
        screeningSkillIds: body.screeningSkillIds || [],
        preferredSkills: body.preferredSkills || [],
      },
      include: {
        employer: {
          select: { id: true, companyName: true },
        },
      },
    });

    await AuditService.log({
      eventType: 'job.created',
      entityType: 'Job',
      entityId: job.id,
      actorUserId: session.user.id,
      afterState: job as unknown as Record<string, unknown>,
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}
