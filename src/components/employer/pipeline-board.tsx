'use client';

import { useState } from 'react';
import { useApplications, useUpdateApplicationStatus } from '@/hooks/useApplications';
import { StatusBadge } from '@/components/ui/status-badge';
import { ScoreRing } from '@/components/ui/score-ring';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { APPLICATION_STATUS_LABELS, ALLOWED_TRANSITIONS } from '@/lib/constants';
import { formatRelativeTime } from '@/lib/utils';
import { Users } from 'lucide-react';

const PIPELINE_TABS = [
  { value: '', label: 'All' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'INTERVIEW_SCHEDULED', label: 'Interview' },
  { value: 'OFFERED', label: 'Offered' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Rejected' },
];

interface PipelineBoardProps {
  jobId: string;
}

export function PipelineBoard({ jobId }: PipelineBoardProps) {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useApplications({ jobId, status: status || undefined, page, limit: 20 });
  const { mutate: updateStatus, isPending } = useUpdateApplicationStatus();

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <Tabs value={status} onValueChange={(v) => { setStatus(v); setPage(1); }} tabs={PIPELINE_TABS} />

      {!data?.data.length ? (
        <EmptyState icon={Users} title="No applications" description="No applications in this status." />
      ) : (
        <div className="space-y-3">
          {data.data.map((app) => {
            const transitions = ALLOWED_TRANSITIONS[app.status]?.filter(
              (s) => !['WITHDRAWN', 'ACCEPTED', 'DECLINED_BY_STUDENT'].includes(s),
            ) || [];

            return (
              <Card key={app.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{app.profile?.anonymizedId || app.profile?.displayName}</span>
                        <StatusBadge status={app.status} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Applied {formatRelativeTime(app.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {app.matchScoreAtApply !== null && <ScoreRing score={app.matchScoreAtApply} size="sm" />}
                    </div>
                  </div>
                  {transitions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                      {transitions.map((next) => (
                        <Button
                          key={next}
                          variant={next === 'REJECTED' ? 'destructive' : next === 'OFFERED' ? 'primary' : 'outline'}
                          size="sm"
                          loading={isPending}
                          onClick={() => updateStatus({ id: app.id, status: next })}
                        >
                          {APPLICATION_STATUS_LABELS[next] || next}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {data && data.pagination.totalPages > 1 && (
        <Pagination page={page} totalPages={data.pagination.totalPages} onPageChange={setPage} className="justify-center" />
      )}
    </div>
  );
}
