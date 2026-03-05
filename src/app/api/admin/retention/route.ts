export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuthorizationService } from '@/lib/authorization/service';
import { ADMIN } from '@/lib/permissions/constants';
import { errorToResponse } from '@/lib/errors';
import { RetentionService } from '@/lib/services/retention.service';
import { enqueueJob, RETENTION_JOB_TYPE } from '@/lib/jobs';

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await AuthorizationService.authorize({ id: session.user.id }, ADMIN.RETENTION_CONFIGURE);

    const recentRuns = await prisma.retentionJobRun.findMany({
      orderBy: { runStartedAt: 'desc' },
      take: 20,
    });

    const lastSuccess = await RetentionService.getLastSuccessTimestamp();

    return NextResponse.json({
      lastSuccessAt: lastSuccess,
      recentRuns,
    });
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await AuthorizationService.authorize({ id: session.user.id }, ADMIN.RETENTION_CONFIGURE);

    // Trigger retention job manually
    const jobId = await enqueueJob(RETENTION_JOB_TYPE, {}, { maxAttempts: 1 });

    return NextResponse.json({ message: 'Retention job enqueued', jobId });
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}
