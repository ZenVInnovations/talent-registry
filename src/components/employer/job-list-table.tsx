'use client';

import Link from 'next/link';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { JOB_TYPE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import type { Job } from '@/lib/api/jobs';

interface JobListTableProps {
  jobs: Job[];
}

export function JobListTable({ jobs }: JobListTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead className="hidden sm:table-cell">Type</TableHead>
          <TableHead className="hidden md:table-cell">Domain</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden md:table-cell">Posted</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.id}>
            <TableCell className="font-medium">{job.title}</TableCell>
            <TableCell className="hidden sm:table-cell">{JOB_TYPE_LABELS[job.type] || job.type}</TableCell>
            <TableCell className="hidden md:table-cell">{job.domain}</TableCell>
            <TableCell><StatusBadge status={job.status} type="job" /></TableCell>
            <TableCell className="hidden md:table-cell">{formatDate(job.createdAt)}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Link href={`/employer/jobs/${job.id}`}>
                  <Button variant="ghost" size="sm">Edit</Button>
                </Link>
                <Link href={`/employer/jobs/${job.id}/applications`}>
                  <Button variant="outline" size="sm">Applications</Button>
                </Link>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
