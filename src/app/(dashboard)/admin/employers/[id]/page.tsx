'use client';

import { useParams } from 'next/navigation';
import { useEmployer, useVerifyEmployer } from '@/hooks/useEmployer';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { COMPANY_SIZE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Globe, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

export default function EmployerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: employer, isLoading } = useEmployer(id);
  const { mutate: verify, isPending } = useVerifyEmployer();

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (!employer) return <div className="py-12 text-center text-muted-foreground">Employer not found</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin/employers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Employers
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{employer.companyName}</h1>
          <StatusBadge status={employer.verificationStatus} type="employer" />
        </div>
        {employer.verificationStatus === 'PENDING' && (
          <div className="flex gap-2">
            <Button size="sm" loading={isPending} onClick={() => verify({ id: employer.id, data: { status: 'APPROVED' } })}>Approve</Button>
            <Button variant="destructive" size="sm" loading={isPending} onClick={() => verify({ id: employer.id, data: { status: 'REJECTED' } })}>Reject</Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div><p className="text-xs text-muted-foreground">Sector</p><p className="text-sm font-medium">{employer.companySector}</p></div>
          <div><p className="text-xs text-muted-foreground">Size</p><p className="text-sm font-medium">{COMPANY_SIZE_LABELS[employer.companySize]}</p></div>
          {employer.website && (
            <div className="flex items-center gap-1"><Globe className="h-3.5 w-3.5 text-muted-foreground" /><a href={employer.website} className="text-sm text-primary hover:underline" target="_blank" rel="noopener noreferrer">{employer.website}</a></div>
          )}
          <div><p className="text-xs text-muted-foreground">Registered</p><p className="text-sm font-medium">{formatDate(employer.createdAt)}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm font-medium">{employer.contactName}</p>
          <p className="inline-flex items-center gap-1 text-sm text-muted-foreground"><Mail className="h-3.5 w-3.5" />{employer.contactEmail}</p>
          {employer.contactPhone && <p className="inline-flex items-center gap-1 text-sm text-muted-foreground"><Phone className="h-3.5 w-3.5" />{employer.contactPhone}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
