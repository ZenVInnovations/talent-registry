export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const members = await prisma.member.findMany({
      where: { userId: session.user.id },
      include: {
        memberRoles: {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
          },
        },
      },
    });

    const roles = new Set<string>();
    const permissions = new Set<string>();

    for (const member of members) {
      for (const memberRole of member.memberRoles) {
        roles.add(memberRole.role.name);
        for (const perm of memberRole.role.permissions) {
          permissions.add(perm.permission);
        }
      }
    }

    return NextResponse.json({
      roles: Array.from(roles),
      permissions: Array.from(permissions),
    });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
