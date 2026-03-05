export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuthorizationService } from '@/lib/authorization/service';
import { ADMIN } from '@/lib/permissions/constants';
import { errorToResponse } from '@/lib/errors';
import { AuditService } from '@/lib/services/audit.service';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await AuthorizationService.authorize({ id: session.user.id }, ADMIN.AUDIT_VIEW);

    const { searchParams } = new URL(req.url);

    const result = await AuditService.query({
      entityType: searchParams.get('entityType') || undefined,
      entityId: searchParams.get('entityId') || undefined,
      actorUserId: searchParams.get('actorUserId') || undefined,
      eventType: searchParams.get('eventType') || undefined,
      from: searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined,
      to: searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: Math.min(100, parseInt(searchParams.get('limit') || '50', 10)),
    });

    return NextResponse.json(result);
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}
