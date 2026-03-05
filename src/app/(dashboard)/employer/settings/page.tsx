'use client';

import { useEmployers, useUpdateEmployer } from '@/hooks/useEmployer';
import { CompanyForm } from '@/components/employer/company-form';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

export default function EmployerSettingsPage() {
  const { data: employers, isLoading } = useEmployers();
  const { mutate: update, isPending } = useUpdateEmployer();

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  const employer = employers?.data[0];
  if (!employer) return <div className="py-12 text-center text-muted-foreground">No employer found</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Company Settings</h1>
        <p className="text-muted-foreground">Manage your company profile</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Verification Status</CardTitle></CardHeader>
        <CardContent>
          <StatusBadge status={employer.verificationStatus} type="employer" />
          {employer.verificationStatus === 'PENDING' && (
            <p className="mt-2 text-sm text-muted-foreground">Your company is awaiting verification by the ZenV BD team.</p>
          )}
        </CardContent>
      </Card>

      <CompanyForm
        initialData={employer as unknown as Record<string, string>}
        onSubmit={(data) => update({ id: employer.id, data })}
        loading={isPending}
        submitLabel="Update Company"
      />
    </div>
  );
}
