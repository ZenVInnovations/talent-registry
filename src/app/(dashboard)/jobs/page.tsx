'use client';

import { useState } from 'react';
import { useJobs } from '@/hooks/useJobs';
import { JobCard } from '@/components/jobs/job-card';
import { JobFilters } from '@/components/jobs/job-filters';
import { Pagination } from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Briefcase } from 'lucide-react';

export default function JobsPage() {
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useJobs({ search, domain, type, page, limit: 12 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Jobs</h1>
        <p className="text-muted-foreground">Discover opportunities that match your skills</p>
      </div>

      <JobFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        domain={domain}
        onDomainChange={(v) => { setDomain(v); setPage(1); }}
        type={type}
        onTypeChange={(v) => { setType(v); setPage(1); }}
        onClearAll={() => { setSearch(''); setDomain(''); setType(''); setPage(1); }}
      />

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : !data?.data.length ? (
        <EmptyState icon={Briefcase} title="No jobs found" description="Try adjusting your filters or check back later." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((job) => (
              <JobCard key={job.id} job={job} />
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
