export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuthorizationService } from '@/lib/authorization/service';
import { CONSENT } from '@/lib/permissions/constants';
import { errorToResponse, NotFoundError } from '@/lib/errors';
import { parseBody } from '@/lib/api-utils';
import { ConsentService } from '@/lib/services/consent.service';
import { updateConsentSchema, employerOverrideSchema } from '@/lib/validations/profile';

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) throw new NotFoundError('StudentProfile');

    const consent = await ConsentService.getCurrentConsent(profile.id);
    return NextResponse.json(consent);
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await AuthorizationService.authorize({ id: session.user.id }, CONSENT.MANAGE_OWN);

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) throw new NotFoundError('StudentProfile');

    const body = await parseBody(req, updateConsentSchema);
    const consent = await ConsentService.updateConsent(profile.id, body, session.user.id);

    return NextResponse.json(consent);
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

    await AuthorizationService.authorize({ id: session.user.id }, CONSENT.MANAGE_OWN);

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) throw new NotFoundError('StudentProfile');

    const rawBody = await req.json();
    const action = rawBody.action;

    if (action === 'grant_override') {
      const body = employerOverrideSchema.parse(rawBody);
      await ConsentService.grantEmployerOverride(
        profile.id,
        body.employerId,
        body.grantedFields,
        session.user.id,
        body.expiresInDays
      );
      return NextResponse.json({ success: true });
    }

    if (action === 'revoke_override') {
      const { employerId } = rawBody;
      if (!employerId) {
        return NextResponse.json({ error: 'employerId is required' }, { status: 400 });
      }
      await ConsentService.revokeEmployerOverride(profile.id, employerId, session.user.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}
