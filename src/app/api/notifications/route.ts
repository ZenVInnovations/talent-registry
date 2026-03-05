export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { errorToResponse } from '@/lib/errors';
import { getPaginationParams } from '@/lib/api-utils';
import { NotificationService } from '@/lib/services/notification.service';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { page, limit } = getPaginationParams(req);
    const { searchParams } = new URL(req.url);
    const read = searchParams.get('read');

    const result = await NotificationService.getUserNotifications({
      userId: session.user.id,
      read: read !== null ? read === 'true' : undefined,
      page,
      limit,
    });

    const unreadCount = await NotificationService.getUnreadCount(session.user.id);

    return NextResponse.json({ ...result, unreadCount });
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, notificationId } = await req.json();

    if (action === 'mark_read' && notificationId) {
      await NotificationService.markAsRead(notificationId, session.user.id);
      return NextResponse.json({ success: true });
    }

    if (action === 'mark_all_read') {
      await NotificationService.markAllAsRead(session.user.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    const { body, status } = errorToResponse(error);
    return NextResponse.json(body, { status });
  }
}
