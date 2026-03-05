'use client';

import { Button } from '@/components/ui/button';
import { useUpdateJobStatus } from '@/hooks/useJobs';

const STATUS_ACTIONS: Record<string, { label: string; next: string; variant: 'primary' | 'outline' | 'destructive' }[]> = {
  DRAFT: [{ label: 'Publish', next: 'ACTIVE', variant: 'primary' }],
  ACTIVE: [
    { label: 'Pause', next: 'PAUSED', variant: 'outline' },
    { label: 'Close', next: 'CLOSED', variant: 'destructive' },
    { label: 'Mark Filled', next: 'FILLED', variant: 'primary' },
  ],
  PAUSED: [
    { label: 'Resume', next: 'ACTIVE', variant: 'primary' },
    { label: 'Close', next: 'CLOSED', variant: 'destructive' },
  ],
};

interface JobStatusControlProps {
  jobId: string;
  currentStatus: string;
}

export function JobStatusControl({ jobId, currentStatus }: JobStatusControlProps) {
  const { mutate, isPending } = useUpdateJobStatus();
  const actions = STATUS_ACTIONS[currentStatus] || [];

  if (actions.length === 0) return null;

  return (
    <div className="flex gap-2">
      {actions.map((action) => (
        <Button
          key={action.next}
          variant={action.variant}
          size="sm"
          loading={isPending}
          onClick={() => mutate({ id: jobId, status: action.next })}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
