import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';

interface TimelineEvent {
  status: string;
  changedAt: string;
  changedBy?: string;
  reason?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  statusLabels?: Record<string, string>;
  className?: string;
}

export function Timeline({ events, statusLabels = {}, className }: TimelineProps) {
  return (
    <div className={cn('relative space-y-4 pl-6', className)}>
      <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border" />
      {events.map((event, i) => (
        <div key={i} className="relative">
          <div className={cn(
            'absolute -left-6 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background',
            i === 0 ? 'bg-primary' : 'bg-muted-foreground/30',
          )} />
          <div>
            <p className="text-sm font-medium">{statusLabels[event.status] || event.status}</p>
            <p className="text-xs text-muted-foreground">{formatRelativeTime(event.changedAt)}</p>
            {event.reason && <p className="mt-1 text-xs text-muted-foreground">{event.reason}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
