export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuthorizationService } from '@/lib/authorization/service';
import { PLACEMENT, APPLICATION } from '@/lib/permissions/constants';
import { errorToResponse, NotFoundError, ValidationError } from '@/lib/errors';
import { getPaginationParams, parseBody } from '@/lib/api-utils';
import { createPlacementSchema } from '@/lib/validations/placement';
import { AuditService } from '@/lib/services/audit.service';
import { EventPublisher } from '@/lib/events/publisher';
import { SUBJECTS } from '@/lib/events/types';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { page, limit, skip } = getPaginationParams(req);

    const canViewMetrics = await AuthorizationService.can(
      { id: session.user.id },
      APPLICATION.VIEW_METRICS
    );

    const where: Record<string, unknown> = { deletedAt: null };

    if (!canViewMetrics) {
      // Students see own placements, employers see their placements
      const profile = await prisma.studentProfile.findUnique({
        where: { userId: session.user.id },
      });
      const member = await prisma.member.findFirst({
        where: { userId: session.user.id, employerId: { not: null } },
      });

      if (profile) {
        where.application = { profileId: profile.id };
      } else if (member?.employerId) {
        where.application = { employerId: member.employerId };
      } else {
        return NextResponse.json({ data: [], pagination: { total: 0, page, limit, totalPages: 0 } });
      }
    }

    const [placements, total] = await Promise.all([
      prisma.placement.findMany({
        where,
        include: {
          application: {
            select: {
              id: true,
              job: { select: { id: true, title: true, domain: true } },
              employer: { select: { id: true, companyName: true } },
              profile: { select: { anonymizedId: true, displayName: true } },
            },
          },
        },
        orderBy: { recordedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.placement.count({ where }),
    ]);

    return NextResponse.json({
      data: placements,
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

    await AuthorizationService.authorize({ id: session.user.id }, PLACEMENT.RECORD);

    const body = await parseBody(req, createPlacementSchema);

    const application = await prisma.application.findUnique({
      where: { id: body.applicationId, deletedAt: null },
      include: {
        profile: { select: { userId: true } },
        job: { select: { employerId: true } },
        placement: true,
      },
    });

    if (!application) throw new NotFoundError('Application', body.applicationId);
    if (application.status !== 'ACCEPTED') {
      throw new ValidationError('Application must be in ACCEPTED status to record placement');
    }
    if (application.placement) {
      throw new ValidationError('Placement already recorded for this application');
    }

    // Verify employer membership
    const isEmployer = await prisma.member.findFirst({
      where: { userId: session.user.id, employerId: application.job.employerId },
    });
    if (!isEmployer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const placement = await prisma.placement.create({
      data: {
        applicationId: body.applicationId,
        type: body.type,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        sourceOpportunityId: body.sourceOpportunityId,
      },
      include: {
        application: {
          select: {
            jobId: true,
            profileId: true,
            employerId: true,
            profile: { select: { userId: true } },
          },
        },
      },
    });

    await AuditService.log({
      eventType: 'placement.recorded',
      entityType: 'Placement',
      entityId: placement.id,
      actorUserId: session.user.id,
      afterState: placement as unknown as Record<string, unknown>,
    });

    // Publish event
    EventPublisher.publish(
      SUBJECTS.TALENT_PLACEMENT_RECORDED,
      {
        placementId: placement.id,
        applicationId: body.applicationId,
        jobId: placement.application.jobId,
        userId: placement.application.profile.userId,
        employerId: placement.application.employerId,
        type: body.type,
        startDate: body.startDate,
        sourceOpportunityId: body.sourceOpportunityId || null,
      },
      {
        entityType: 'Placement',
        entityId: placement.id,
        actorUserId: session.user.id,
      }
    ).catch(() => {});

    return NextResponse.json(placement, { status: 201 });
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}
