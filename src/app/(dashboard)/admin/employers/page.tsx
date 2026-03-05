'use client';

import { useState } from 'react';
import { useEmployers } from '@/hooks/useEmployer';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';
import { COMPANY_SIZE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function EmployersPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useEmployers({ status: status || undefined, page, limit: 20 });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Employers</h1>
      <div className="flex gap-3">
        <Select
          placeholder="All Statuses"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          options={[
            { value: 'PENDING', label: 'Pending' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'REJECTED', label: 'Rejected' },
          ]}
        />
      </div>
      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead className="hidden sm:table-cell">Sector</TableHead>
                <TableHead className="hidden md:table-cell">Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <Link href={`/admin/employers/${emp.id}`} className="font-medium text-primary hover:underline">
                      {emp.companyName}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{emp.companySector}</TableCell>
                  <TableCell className="hidden md:table-cell">{COMPANY_SIZE_LABELS[emp.companySize] || emp.companySize}</TableCell>
                  <TableCell><StatusBadge status={emp.verificationStatus} type="employer" /></TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(emp.createdAt)}</TableCell>
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
