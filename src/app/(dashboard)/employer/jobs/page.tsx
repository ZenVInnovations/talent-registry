'use client';

import { useState } from 'react';
import { useEmployers } from '@/hooks/useEmployer';
import { useEmployerJobs } from '@/hooks/useEmployerJobs';
import { JobListTable } from '@/components/employer/job-list-table';
import { Pagination } from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus } from 'lucide-react';
import Link from 'next/link';

export default function EmployerJobsPage() {
  const [page, setPage] = useState(1);
  const { data: employers } = useEmployers();
  const employer = employers?.data[0];
  const { data, isLoading } = useEmployerJobs(employer?.id || '', { page, limit: 20 });

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Job Postings</h1>
          <p className="text-muted-foreground">Manage your job listings</p>
        </div>
        <Link href="/employer/jobs/new">
          <Button><Plus className="mr-2 h-4 w-4" /> New Job</Button>
        </Link>
      </div>

      {!data?.data.length ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs yet"
          description="Create your first job posting to start receiving applications."
          action={<Link href="/employer/jobs/new"><Button>Create Job</Button></Link>}
        />
      ) : (
        <>
          <JobListTable jobs={data.data} />
          <Pagination page={page} totalPages={data.pagination.totalPages} onPageChange={setPage} className="justify-center" />
        </>
      )}
    </div>
  );
}
