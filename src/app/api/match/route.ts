export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuthorizationService } from '@/lib/authorization/service';
import { MATCH } from '@/lib/permissions/constants';
import { errorToResponse } from '@/lib/errors';
import { MatchService } from '@/lib/services/match.service';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await AuthorizationService.authorize({ id: session.user.id }, MATCH.COMPUTE);

    const { jobId, profileId } = await req.json();

    if (!jobId || !profileId) {
      return NextResponse.json(
        { error: 'jobId and profileId are required' },
        { status: 400 }
      );
    }

    const matchScore = await MatchService.getOrComputeMatchScore(jobId, profileId);
    return NextResponse.json(matchScore);
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}
