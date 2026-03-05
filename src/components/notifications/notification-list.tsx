'use client';

import { cn, formatRelativeTime } from '@/lib/utils';
import { useNotifications, useMarkNotificationRead } from '@/hooks/useNotifications';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function NotificationList() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useNotifications({ page, limit: 20 });
  const { mutate: markRead } = useMarkNotificationRead();

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;
  if (!data?.data.length) return <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />;

  return (
    <div className="space-y-2">
      {data.data.map((n) => (
        <div
          key={n.id}
          className={cn(
            'rounded-lg border border-border p-4 transition-colors',
            !n.read && 'bg-primary/5 border-primary/20',
          )}
          onClick={() => { if (!n.read) markRead(n.id); }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className={cn('text-sm', !n.read && 'font-semibold')}>{n.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
              {n.link && (
                <Link href={n.link} className="mt-1 inline-block text-xs text-primary hover:underline">
                  View details
                </Link>
              )}
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(n.createdAt)}</span>
          </div>
        </div>
      ))}
      {data.pagination.totalPages > 1 && (
        <Pagination page={page} totalPages={data.pagination.totalPages} onPageChange={setPage} className="justify-center pt-4" />
      )}
    </div>
  );
}
