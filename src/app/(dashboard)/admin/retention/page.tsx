'use client';

import { useRetentionData, useTriggerRetention } from '@/hooks/useRetention';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Database, Play } from 'lucide-react';

export default function RetentionPage() {
  const { data, isLoading } = useRetentionData();
  const { mutate: trigger, isPending } = useTriggerRetention();

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  const runs = data?.recentRuns || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Data Retention</h1>
          <p className="text-muted-foreground">Manage data retention and anonymization</p>
        </div>
        <Button onClick={() => trigger()} loading={isPending}>
          <Play className="mr-2 h-4 w-4" /> Trigger Run
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Status</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div><p className="text-xs text-muted-foreground">Last Successful Run</p><p className="text-sm font-medium">{data?.lastSuccessAt ? formatDate(data.lastSuccessAt) : 'Never'}</p></div>
          <div><p className="text-xs text-muted-foreground">Recent Runs</p><p className="text-lg font-bold">{runs.length}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Runs</CardTitle></CardHeader>
        <CardContent>
          {!runs.length ? (
            <p className="text-sm text-muted-foreground">No retention runs yet.</p>
          ) : (
            <div className="space-y-3">
              {runs.map((run) => (
                <div key={run.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{formatDate(run.startedAt)}</span>
                      <Badge variant={run.status === 'COMPLETED' ? 'success' : run.status === 'FAILED' ? 'destructive' : 'default'}>
                        {run.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{run.phase}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Processed:</span> {run.recordsProcessed}</div>
                    <div><span className="text-muted-foreground">Anonymized:</span> {run.recordsAnonymized}</div>
                    <div><span className="text-muted-foreground">Deleted:</span> {run.recordsDeleted}</div>
                  </div>
                  {run.errors.length > 0 && (
                    <div className="mt-2 text-xs text-destructive">{run.errors.length} error(s)</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
