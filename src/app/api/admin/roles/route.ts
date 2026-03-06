export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuthorizationService } from '@/lib/authorization/service';
import { ADMIN } from '@/lib/permissions/constants';
import { errorToResponse } from '@/lib/errors';

interface RolePermission {
  permission: string;
}

interface RoleWithPermissions {
  id: string;
  name: string;
  description: string | null;
  scope: string;
  isDefault: boolean;
  position: number;
  permissions: RolePermission[];
  _count: { memberRoles: number };
}

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
      data: (roles as unknown as RoleWithPermissions[]).map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        scope: r.scope,
        isDefault: r.isDefault,
        position: r.position,
        permissions: r.permissions.map((p) => p.permission),
        memberCount: r._count.memberRoles,
      })),
    });
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}
