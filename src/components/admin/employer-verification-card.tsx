'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useVerifyEmployer } from '@/hooks/useEmployer';
import { COMPANY_SIZE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { Building2, Globe, Mail, Phone } from 'lucide-react';
import type { Employer } from '@/lib/api/employers';

interface EmployerVerificationCardProps {
  employer: Employer;
}

export function EmployerVerificationCard({ employer }: EmployerVerificationCardProps) {
  const { mutate: verify, isPending } = useVerifyEmployer();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">{employer.companyName}</h3>
              <StatusBadge status={employer.verificationStatus} type="employer" />
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span>{employer.companySector}</span>
              <span>{COMPANY_SIZE_LABELS[employer.companySize] || employer.companySize}</span>
              {employer.website && (
                <span className="inline-flex items-center gap-1">
                  <Globe className="h-3 w-3" />{employer.website}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3 w-3" />{employer.contactEmail}
              </span>
              {employer.contactPhone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3 w-3" />{employer.contactPhone}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Registered {formatDate(employer.createdAt)}</p>
          </div>
          {employer.verificationStatus === 'PENDING' && (
            <div className="flex gap-2 shrink-0">
              <Button variant="primary" size="sm" loading={isPending} onClick={() => verify({ id: employer.id, data: { status: 'APPROVED' } })}>
                Approve
              </Button>
              <Button variant="destructive" size="sm" loading={isPending} onClick={() => verify({ id: employer.id, data: { status: 'REJECTED' } })}>
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
