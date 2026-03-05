'use client';

import { useState } from 'react';
import { useJobs } from '@/hooks/useJobs';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select } from '@/components/ui/select';
import { SearchInput } from '@/components/ui/search-input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';
import { JOB_TYPE_LABELS, JOB_STATUS_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export default function AdminJobsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useJobs({ search, status: status || undefined, page, limit: 20 });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Jobs</h1>
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput placeholder="Search jobs..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} onClear={() => setSearch('')} className="sm:max-w-sm" />
        <Select placeholder="All Statuses" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} options={Object.entries(JOB_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
      </div>
      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden sm:table-cell">Employer</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Posted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell className="hidden sm:table-cell">{job.employer?.companyName}</TableCell>
                  <TableCell className="hidden md:table-cell">{JOB_TYPE_LABELS[job.type] || job.type}</TableCell>
                  <TableCell><StatusBadge status={job.status} type="job" /></TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(job.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {data && <Pagination page={page} totalPages={data.pagination.totalPages} onPageChange={setPage} className="justify-center" />}
        </>
      )}
    </div>
  );
}
