export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuthorizationService } from '@/lib/authorization/service';
import { ANALYTICS } from '@/lib/permissions/constants';
import { errorToResponse } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await AuthorizationService.authorize({ id: session.user.id }, ANALYTICS.VIEW);

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'summary';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (type === 'summary') {
      const [
        totalProfiles,
        activeProfiles,
        totalEmployers,
        verifiedEmployers,
        activeJobs,
        totalApplications,
        totalPlacements,
      ] = await Promise.all([
        prisma.studentProfile.count({ where: { deletedAt: null } }),
        prisma.studentProfile.count({ where: { profileVisible: true, deletedAt: null } }),
        prisma.employer.count({ where: { deletedAt: null } }),
        prisma.employer.count({ where: { verificationStatus: 'APPROVED', deletedAt: null } }),
        prisma.job.count({ where: { status: 'ACTIVE', deletedAt: null } }),
        prisma.application.count({ where: { deletedAt: null } }),
        prisma.placement.count({ where: { deletedAt: null } }),
      ]);

      return NextResponse.json({
        summary: {
          totalProfiles,
          activeProfiles,
          totalEmployers,
          verifiedEmployers,
          activeJobs,
          totalApplications,
          totalPlacements,
        },
      });
    }

    if (type === 'applications') {
      const dateFilter: Record<string, unknown> = {};
      if (from) dateFilter.gte = new Date(from);
      if (to) dateFilter.lte = new Date(to);

      const data = await prisma.analyticsApplicationDaily.findMany({
        where: from || to ? { date: dateFilter } : {},
        orderBy: { date: 'desc' },
        take: 100,
      });

      return NextResponse.json({ data });
    }

    if (type === 'placements') {
      const data = await prisma.analyticsPlacementMonthly.findMany({
        orderBy: { month: 'desc' },
        take: 24,
      });

      return NextResponse.json({ data });
    }

    if (type === 'skills') {
      const data = await prisma.analyticsSkillDemandWeekly.findMany({
        orderBy: { weekStart: 'desc' },
        take: 52,
      });

      return NextResponse.json({ data });
    }

    if (type === 'funnel') {
      const statusCounts = await prisma.application.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: true,
      });

      return NextResponse.json({
        funnel: statusCounts.map((s) => ({
          status: s.status,
          count: s._count,
        })),
      });
    }

    return NextResponse.json({ error: 'Unknown analytics type' }, { status: 400 });
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}
