export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuthorizationService } from '@/lib/authorization/service';
import { TALENT, PROFILE } from '@/lib/permissions/constants';
import { ConsentService } from '@/lib/services/consent.service';
import { errorToResponse } from '@/lib/errors';
import { getPaginationParams } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userCtx = { id: userId };

    // Determine viewer role for consent filtering
    const [canBrowse, canViewAll] = await Promise.all([
      AuthorizationService.can(userCtx, TALENT.BROWSE),
      AuthorizationService.can(userCtx, PROFILE.VIEW_ALL),
    ]);

    if (!canBrowse && !canViewAll) {
      return NextResponse.json(
        { error: 'Insufficient permissions to browse profiles' },
        { status: 403 }
      );
    }

    const viewerRole = canViewAll ? 'INTERNAL' : 'EMPLOYER_BROWSING';

    // Resolve employer context for consent override checks
    let viewerEmployerId: string | undefined;
    if (canBrowse && !canViewAll) {
      const member = await prisma.member.findFirst({
        where: { userId, employerId: { not: null } },
      });
      viewerEmployerId = member?.employerId ?? undefined;
    }

    // Pagination
    const { page, limit, skip } = getPaginationParams(req);
    const { searchParams } = new URL(req.url);

    // Filters
    const domain = searchParams.get('domain');
    const institution = searchParams.get('institution');
    const skills = searchParams.get('skills'); // comma-separated
    const sortByMatch = searchParams.get('sortByMatch') === 'true';
    const jobId = searchParams.get('jobId'); // for match-score sorting

    const where: Record<string, unknown> = {
      deletedAt: null,
      profileVisible: true,
    };

    if (domain) {
      where.domains = { has: domain };
    }
    if (institution) {
      where.institutionName = { contains: institution, mode: 'insensitive' };
    }
    if (skills) {
      const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean);
      if (skillList.length > 0) {
        where.technologies = { hasSome: skillList };
      }
    }

    // When sorting by match score for a specific job, join through MatchScore
    const orderBy: Record<string, unknown>[] = sortByMatch && jobId
      ? [{ matchScores: { _count: 'desc' } }]
      : [{ updatedAt: 'desc' }];

    const [profiles, total] = await Promise.all([
      prisma.studentProfile.findMany({
        where,
        include: {
          ...(sortByMatch && jobId
            ? {
                matchScores: {
                  where: { jobId, stale: false },
                  orderBy: { overallScore: 'desc' },
                  take: 1,
                },
              }
            : {}),
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.studentProfile.count({ where }),
    ]);

    // If sorting by match score, re-sort in memory for accurate ordering
    let sortedProfiles = profiles;
    if (sortByMatch && jobId) {
      sortedProfiles = [...profiles].sort((a, b) => {
        const scoreA = a.matchScores?.[0]?.overallScore ?? 0;
        const scoreB = b.matchScores?.[0]?.overallScore ?? 0;
        return Number(scoreB) - Number(scoreA);
      });
    }

    // Apply consent filtering to each profile
    const filtered = await Promise.all(
      sortedProfiles.map(async (profile) => {
        const consent = await ConsentService.getCurrentConsent(profile.id);
        const raw = profile as unknown as Record<string, unknown>;
        return ConsentService.filterProfileByConsent(
          raw,
          viewerRole,
          consent.fieldConsents,
          consent.employerOverrides,
          viewerEmployerId
        );
      })
    );

    return NextResponse.json({
      data: filtered,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Profiles are created via events.' },
    { status: 405, headers: { Allow: 'GET' } }
  );
}
