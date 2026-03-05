export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuthorizationService } from '@/lib/authorization/service';
import { MATCH, TALENT } from '@/lib/permissions/constants';
import { errorToResponse, NotFoundError } from '@/lib/errors';
import { getPaginationParams } from '@/lib/api-utils';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = await params;
    const { page, limit, skip } = getPaginationParams(req);

    const job = await prisma.job.findUnique({
      where: { id: jobId, deletedAt: null },
    });
    if (!job) throw new NotFoundError('Job', jobId);

    // Check: employer owns job, or student viewing own score, or BD/admin
    const isEmployer = await prisma.member.findFirst({
      where: { userId: session.user.id, employerId: job.employerId },
    });

    const canBrowse = isEmployer
      ? await AuthorizationService.can(
          { id: session.user.id },
          TALENT.BROWSE,
          { employerId: job.employerId }
        )
      : false;

    const isAdmin = await AuthorizationService.can(
      { id: session.user.id },
      MATCH.COMPUTE
    );

    if (!canBrowse && !isAdmin) {
      // Student can only view own match score
      const profile = await prisma.studentProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!profile) {
        return NextResponse.json({ data: [], pagination: { total: 0, page, limit, totalPages: 0 } });
      }

      const score = await prisma.matchScore.findUnique({
        where: { jobId_profileId: { jobId, profileId: profile.id } },
      });

      return NextResponse.json({
        data: score ? [score] : [],
        pagination: { total: score ? 1 : 0, page: 1, limit: 1, totalPages: score ? 1 : 0 },
      });
    }

    const [scores, total] = await Promise.all([
      prisma.matchScore.findMany({
        where: { jobId },
        include: {
          profile: {
            select: { anonymizedId: true, domains: true, institutionName: true },
          },
        },
        orderBy: { overallScore: 'desc' },
        skip,
        take: limit,
      }),
      prisma.matchScore.count({ where: { jobId } }),
    ]);

    return NextResponse.json({
      data: scores,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}
