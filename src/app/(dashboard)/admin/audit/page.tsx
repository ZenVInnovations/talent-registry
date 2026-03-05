'use client';

import { useState } from 'react';
import { useAuditLogs } from '@/hooks/useAudit';
import { CodeBlock } from '@/components/ui/code-block';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/utils';
import { FolderKanban } from 'lucide-react';

const ENTITY_TYPES = ['Application', 'Job', 'Employer', 'Profile', 'Consent', 'Placement'];

export default function AuditPage() {
  const [entityType, setEntityType] = useState('');
  const [eventType, setEventType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useAuditLogs({
    entityType: entityType || undefined,
    eventType: eventType || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    limit: 20,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit Trail</h1>

      <div className="flex flex-wrap gap-3">
        <Select
          placeholder="All Entity Types"
          value={entityType}
          onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
          options={ENTITY_TYPES.map((t) => ({ value: t, label: t }))}
        />
        <Input
          placeholder="Event type..."
          value={eventType}
          onChange={(e) => { setEventType(e.target.value); setPage(1); }}
          className="w-48"
        />
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartChange={(v) => { setStartDate(v); setPage(1); }}
          onEndChange={(v) => { setEndDate(v); setPage(1); }}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : !data?.data.length ? (
        <EmptyState icon={FolderKanban} title="No audit logs" description="No logs match the current filters." />
      ) : (
        <>
          <div className="space-y-2">
            {data.data.map((log) => (
              <div key={log.id} className="rounded-lg border border-border">
                <button
                  className="flex w-full items-center justify-between p-3 text-left text-sm hover:bg-muted/50"
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground">{formatDate(log.createdAt)}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">{log.eventType}</span>
                    <span className="text-muted-foreground">{log.entityType}:{log.entityId.slice(0, 8)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{log.actorUserId?.slice(0, 8) || 'system'}</span>
                </button>
                {expandedId === log.id && (
                  <div className="border-t border-border p-3 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {log.beforeState && <CodeBlock data={log.beforeState} title="Before" collapsible />}
                      {log.afterState && <CodeBlock data={log.afterState} title="After" collapsible />}
                    </div>
                    {log.metadata && <CodeBlock data={log.metadata} title="Metadata" collapsible />}
                    {log.ipAddress && <p className="text-xs text-muted-foreground">IP: {log.ipAddress}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={data.pagination.totalPages} onPageChange={setPage} className="justify-center" />
        </>
      )}
    </div>
  );
}
