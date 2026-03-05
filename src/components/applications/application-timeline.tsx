'use client';

import { Timeline } from '@/components/ui/timeline';
import { APPLICATION_STATUS_LABELS } from '@/lib/constants';
import type { Application } from '@/lib/api/applications';

interface ApplicationTimelineProps {
  application: Application;
}

export function ApplicationTimeline({ application }: ApplicationTimelineProps) {
  const events = Array.isArray(application.statusHistory)
    ? application.statusHistory
    : typeof application.statusHistory === 'string'
      ? JSON.parse(application.statusHistory)
      : [];

  const sortedEvents = [...events].reverse();

  return <Timeline events={sortedEvents} statusLabels={APPLICATION_STATUS_LABELS} />;
}
