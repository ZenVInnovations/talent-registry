'use client';

import { useState } from 'react';
import { useEmployers } from '@/hooks/useEmployer';
import { EmployerVerificationCard } from '@/components/admin/employer-verification-card';
import { Pagination } from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { ClipboardList } from 'lucide-react';

export default function VerificationQueuePage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useEmployers({ status: 'PENDING', page, limit: 20 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Verification Queue</h1>
        <p className="text-muted-foreground">Review and approve employer registrations</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : !data?.data.length ? (
        <EmptyState icon={ClipboardList} title="All clear!" description="No employers waiting for verification." />
      ) : (
        <>
          <div className="space-y-3">
            {data.data.map((emp) => <EmployerVerificationCard key={emp.id} employer={emp} />)}
          </div>
          <Pagination page={page} totalPages={data.pagination.totalPages} onPageChange={setPage} className="justify-center" />
        </>
      )}
    </div>
  );
}
