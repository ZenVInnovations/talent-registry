'use client';

import { useState } from 'react';
import { usePlacements } from '@/hooks/usePlacements';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { CheckSquare, Calendar } from 'lucide-react';
import { JOB_TYPE_LABELS, PLACEMENT_STATUS_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export default function EmployerPlacementsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePlacements({ page, limit: 20 });

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Placements</h1>
        <p className="text-muted-foreground">Track your placement records</p>
      </div>

      {!data?.data.length ? (
        <EmptyState icon={CheckSquare} title="No placements yet" description="Placements will appear here once candidates are placed." />
      ) : (
        <>
          <div className="space-y-3">
            {data.data.map((p) => (
              <Card key={p.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{p.application?.job?.title}</h3>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{JOB_TYPE_LABELS[p.type] || p.type}</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(p.startDate)}{p.endDate ? ` - ${formatDate(p.endDate)}` : ' - Present'}
                        </span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : p.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {PLACEMENT_STATUS_LABELS[p.status] || p.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Pagination page={page} totalPages={data.pagination.totalPages} onPageChange={setPage} className="justify-center" />
        </>
      )}
    </div>
  );
}
