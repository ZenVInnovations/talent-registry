'use client';

import { useState } from 'react';
import { useApplications } from '@/hooks/useApplications';
import { ApplicationCard } from '@/components/applications/application-card';
import { Tabs } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText } from 'lucide-react';

const tabs = [
  { value: '', label: 'All' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'OFFERED', label: 'Offered' },
  { value: 'ACCEPTED', label: 'Accepted' },
];

export default function ApplicationsPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useApplications({ status: status || undefined, page, limit: 10 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Applications</h1>
        <p className="text-muted-foreground">Track your job applications</p>
      </div>

      <Tabs value={status} onValueChange={(v) => { setStatus(v); setPage(1); }} tabs={tabs} />

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : !data?.data.length ? (
        <EmptyState icon={FileText} title="No applications" description="Apply to jobs to see your applications here." />
      ) : (
        <>
          <div className="space-y-3">
            {data.data.map((app) => (
              <ApplicationCard key={app.id} application={app} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={data.pagination.totalPages}
            onPageChange={setPage}
            className="justify-center"
          />
        </>
      )}
    </div>
  );
}
