'use client';

import { useRouter } from 'next/navigation';
import { CompanyForm } from '@/components/employer/company-form';
import { useCreateEmployer } from '@/hooks/useEmployer';
import type { Employer } from '@/lib/api/employers';

export default function EmployerRegisterPage() {
  const router = useRouter();
  const { mutate: create, isPending } = useCreateEmployer();

  const handleSubmit = (data: Record<string, string>) => {
    create(data as Partial<Employer>, { onSuccess: () => router.push('/employer') });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Register Your Company</h1>
        <p className="text-muted-foreground">Create an employer account to start posting jobs</p>
      </div>
      <CompanyForm onSubmit={handleSubmit} loading={isPending} submitLabel="Register Company" />
    </div>
  );
}
