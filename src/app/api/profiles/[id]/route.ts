export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuthorizationService } from '@/lib/authorization/service';
import { PROFILE, TALENT } from '@/lib/permissions/constants';
import { ConsentService } from '@/lib/services/consent.service';
import { errorToResponse, NotFoundError, AuthorizationError } from '@/lib/errors';
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
    const userId = session.user.id;
    const userCtx = { id: userId };

    const profile = await prisma.studentProfile.findUnique({
      where: { id, deletedAt: null },
    });

    if (!profile) {
      throw new NotFoundError('StudentProfile', id);
    }

    // Determine viewer role
    const isOwner = profile.userId === userId;
    let viewerRole: 'STUDENT_SELF' | 'EMPLOYER_BROWSING' | 'EMPLOYER_REVIEWING' | 'INTERNAL';
    let viewerEmployerId: string | undefined;

    if (isOwner) {
      viewerRole = 'STUDENT_SELF';
    } else {
      const [canViewAll, canBrowse] = await Promise.all([
        AuthorizationService.can(userCtx, PROFILE.VIEW_ALL),
        AuthorizationService.can(userCtx, TALENT.BROWSE),
      ]);

      if (canViewAll) {
        viewerRole = 'INTERNAL';
      } else if (canBrowse) {
        // Check if employer has an active application from this student
        const member = await prisma.member.findFirst({
          where: { userId, employerId: { not: null } },
        });
        viewerEmployerId = member?.employerId ?? undefined;

        if (viewerEmployerId) {
          const hasApplication = await prisma.application.findFirst({
            where: {
              profileId: id,
              employerId: viewerEmployerId,
              deletedAt: null,
              status: { notIn: ['WITHDRAWN', 'REJECTED'] },
            },
          });
          viewerRole = hasApplication ? 'EMPLOYER_REVIEWING' : 'EMPLOYER_BROWSING';
        } else {
          viewerRole = 'EMPLOYER_BROWSING';
        }
      } else {
        throw new AuthorizationError('You do not have permission to view this profile');
      }

      // Non-owner viewing a hidden profile requires PROFILE.VIEW_ALL
      if (!profile.profileVisible && viewerRole !== 'INTERNAL') {
        throw new NotFoundError('StudentProfile', id);
      }
    }

    const consent = await ConsentService.getCurrentConsent(profile.id);
    const raw = profile as unknown as Record<string, unknown>;
    const filtered = ConsentService.filterProfileByConsent(
      raw,
      viewerRole,
      consent.fieldConsents,
      consent.employerOverrides,
      viewerEmployerId
    );

    return NextResponse.json({ data: filtered });
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
    const userId = session.user.id;

    // Verify the profile belongs to the requesting user
    const profile = await prisma.studentProfile.findUnique({
      where: { id, deletedAt: null },
    });

    if (!profile) {
      throw new NotFoundError('StudentProfile', id);
    }

    if (profile.userId !== userId) {
      throw new AuthorizationError('You can only update your own profile');
    }

    await AuthorizationService.authorize({ id: userId }, PROFILE.UPDATE_OWN);

    const body = await req.json();

    // Only allow student-editable fields
    const allowedFields = new Set([
      'displayName',
      'phone',
      'resumeUrl',
      'profileVisible',
    ]);

    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.has(key)) {
        data[key] = value;
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const beforeState = profile as unknown as Record<string, unknown>;

    const updated = await prisma.studentProfile.update({
      where: { id },
      data,
    });

    await AuditService.log({
      eventType: 'profile.updated',
      entityType: 'StudentProfile',
      entityId: id,
      actorUserId: userId,
      beforeState,
      afterState: updated as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}
