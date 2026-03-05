export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuthorizationService } from '@/lib/authorization/service';
import { PLACEMENT, APPLICATION } from '@/lib/permissions/constants';
import { errorToResponse, NotFoundError } from '@/lib/errors';
import { parseBody } from '@/lib/api-utils';
import { updatePlacementSchema } from '@/lib/validations/placement';
import { AuditService } from '@/lib/services/audit.service';

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

    const placement = await prisma.placement.findUnique({
      where: { id, deletedAt: null },
      include: {
        application: {
          select: {
            id: true,
            job: { select: { id: true, title: true, domain: true } },
            employer: { select: { id: true, companyName: true } },
            profile: { select: { anonymizedId: true, displayName: true, userId: true } },
          },
        },
      },
    });

    if (!placement) throw new NotFoundError('Placement', id);

    // Access check
    const isStudent = placement.application.profile.userId === session.user.id;
    const isEmployer = await prisma.member.findFirst({
      where: { userId: session.user.id, employerId: placement.application.employer.id },
    });
    const canViewAll = await AuthorizationService.can(
      { id: session.user.id },
      APPLICATION.VIEW_METRICS
    );

    if (!isStudent && !isEmployer && !canViewAll) {
      throw new NotFoundError('Placement', id);
    }

    return NextResponse.json(placement);
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

    await AuthorizationService.authorize({ id: session.user.id }, PLACEMENT.RECORD);

    const { id } = await params;
    const body = await parseBody(req, updatePlacementSchema);

    const placement = await prisma.placement.findUnique({
      where: { id, deletedAt: null },
      include: {
        application: { select: { employerId: true } },
      },
    });
    if (!placement) throw new NotFoundError('Placement', id);

    const isEmployer = await prisma.member.findFirst({
      where: { userId: session.user.id, employerId: placement.application.employerId },
    });
    if (!isEmployer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const beforeState = { status: placement.status, endDate: placement.endDate };

    const updated = await prisma.placement.update({
      where: { id },
      data: {
        status: body.status,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      },
    });

    await AuditService.log({
      eventType: 'placement.updated',
      entityType: 'Placement',
      entityId: id,
      actorUserId: session.user.id,
      beforeState: beforeState as Record<string, unknown>,
      afterState: { status: updated.status, endDate: updated.endDate } as Record<string, unknown>,
    });

    return NextResponse.json(updated);
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}
