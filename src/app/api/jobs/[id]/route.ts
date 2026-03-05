export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuthorizationService } from '@/lib/authorization/service';
import { JOB } from '@/lib/permissions/constants';
import { errorToResponse, NotFoundError } from '@/lib/errors';
import { updateJobSchema, jobStatusSchema } from '@/lib/validations/job';
import { AuditService } from '@/lib/services/audit.service';
import { EventPublisher } from '@/lib/events/publisher';
import { SUBJECTS } from '@/lib/events/types';

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

    const job = await prisma.job.findUnique({
      where: { id, deletedAt: null },
      include: {
        employer: {
          select: {
            id: true,
            companyName: true,
            companySector: true,
            logoUrl: true,
            website: true,
          },
        },
        _count: { select: { applications: true, matchScores: true } },
      },
    });

    if (!job) throw new NotFoundError('Job', id);

    // Non-active jobs only visible to employer owner or admin/BD
    if (job.status !== 'ACTIVE') {
      const canViewAll = await AuthorizationService.can(
        { id: session.user.id },
        JOB.VIEW_ALL
      );
      const isOwner = await prisma.member.findFirst({
        where: { userId: session.user.id, employerId: job.employerId },
      });

      if (!canViewAll && !isOwner) {
        throw new NotFoundError('Job', id);
      }
    }

    return NextResponse.json(job);
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
    const rawBody = await req.json();

    const job = await prisma.job.findUnique({
      where: { id, deletedAt: null },
    });
    if (!job) throw new NotFoundError('Job', id);

    // Check ownership or admin
    const isOwner = await prisma.member.findFirst({
      where: { userId: session.user.id, employerId: job.employerId },
    });
    const canViewAll = await AuthorizationService.can(
      { id: session.user.id },
      JOB.VIEW_ALL
    );

    if (!isOwner && !canViewAll) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Handle status change
    if (rawBody.status && Object.keys(rawBody).length === 1) {
      const { status: newStatus } = jobStatusSchema.parse(rawBody);

      const beforeState = { status: job.status };

      const updateData: Record<string, unknown> = { status: newStatus };
      if (newStatus === 'ACTIVE' && !job.postedAt) {
        updateData.postedAt = new Date();
      }

      const updated = await prisma.job.update({
        where: { id },
        data: updateData,
      });

      await AuditService.log({
        eventType: 'job.status_changed',
        entityType: 'Job',
        entityId: id,
        actorUserId: session.user.id,
        beforeState: beforeState as Record<string, unknown>,
        afterState: { status: newStatus } as Record<string, unknown>,
      });

      // Publish event when job goes active
      if (newStatus === 'ACTIVE') {
        EventPublisher.publish(
          SUBJECTS.TALENT_JOB_POSTED,
          {
            jobId: id,
            employerId: job.employerId,
            title: job.title,
            domain: job.domain,
            requiredSkills: job.requiredSkills,
            type: job.type,
          },
          {
            entityType: 'Job',
            entityId: id,
            actorUserId: session.user.id,
          }
        ).catch(() => {}); // Fire and forget
      }

      return NextResponse.json(updated);
    }

    // Regular field update
    if (isOwner) {
      await AuthorizationService.authorize(
        { id: session.user.id },
        JOB.UPDATE_OWN,
        { employerId: job.employerId }
      );
    }

    const body = updateJobSchema.parse(rawBody);
    const beforeState = job as unknown as Record<string, unknown>;

    const updated = await prisma.job.update({
      where: { id },
      data: {
        ...body,
        closesAt: body.closesAt ? new Date(body.closesAt) : undefined,
      },
      include: {
        employer: { select: { id: true, companyName: true } },
      },
    });

    await AuditService.log({
      eventType: 'job.updated',
      entityType: 'Job',
      entityId: id,
      actorUserId: session.user.id,
      beforeState,
      afterState: updated as unknown as Record<string, unknown>,
    });

    return NextResponse.json(updated);
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const job = await prisma.job.findUnique({ where: { id, deletedAt: null } });
    if (!job) throw new NotFoundError('Job', id);

    const isOwner = await prisma.member.findFirst({
      where: { userId: session.user.id, employerId: job.employerId },
    });
    const canViewAll = await AuthorizationService.can(
      { id: session.user.id },
      JOB.VIEW_ALL
    );

    if (!isOwner && !canViewAll) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.job.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'CLOSED' },
    });

    await AuditService.log({
      eventType: 'job.deleted',
      entityType: 'Job',
      entityId: id,
      actorUserId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}
