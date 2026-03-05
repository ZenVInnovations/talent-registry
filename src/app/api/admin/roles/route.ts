export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuthorizationService } from '@/lib/authorization/service';
import { ADMIN } from '@/lib/permissions/constants';
import { errorToResponse } from '@/lib/errors';

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await AuthorizationService.authorize({ id: session.user.id }, ADMIN.ACCESS);

    const roles = await prisma.role.findMany({
      include: {
        permissions: { select: { permission: true } },
        _count: { select: { memberRoles: true } },
      },
      orderBy: { position: 'asc' },
    });

    return NextResponse.json({
      data: roles.map((r: typeof roles[number]) => ({
        ...r,
        permissions: r.permissions.map((p: { permission: string }) => p.permission),
        memberCount: r._count.memberRoles,
      })),
    });
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}
