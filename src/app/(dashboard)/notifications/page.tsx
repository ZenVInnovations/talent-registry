'use client';

import { NotificationList } from '@/components/notifications/notification-list';

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">Stay updated on your applications and opportunities</p>
      </div>
      <NotificationList />
    </div>
  );
}
