'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FormField } from '@/components/ui/form-field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { COMPANY_SIZE_LABELS } from '@/lib/constants';

interface CompanyFormProps {
  initialData?: Record<string, string>;
  onSubmit: (data: Record<string, string>) => void;
  loading?: boolean;
  submitLabel?: string;
}

export function CompanyForm({ initialData = {}, onSubmit, loading, submitLabel = 'Save' }: CompanyFormProps) {
  const [form, setForm] = useState({
    companyName: initialData.companyName || '',
    companySector: initialData.companySector || '',
    companySize: initialData.companySize || '',
    website: initialData.website || '',
    logoUrl: initialData.logoUrl || '',
    contactName: initialData.contactName || '',
    contactEmail: initialData.contactEmail || '',
    contactPhone: initialData.contactPhone || '',
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Company Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Company Name" required>
            <Input value={form.companyName} onChange={(e) => set('companyName', e.target.value)} required />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Sector" required>
              <Input value={form.companySector} onChange={(e) => set('companySector', e.target.value)} required />
            </FormField>
            <FormField label="Company Size" required>
              <Select
                value={form.companySize}
                onChange={(e) => set('companySize', e.target.value)}
                options={Object.entries(COMPANY_SIZE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
                placeholder="Select size"
              />
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Website">
              <Input value={form.website} onChange={(e) => set('website', e.target.value)} type="url" placeholder="https://" />
            </FormField>
            <FormField label="Logo URL">
              <Input value={form.logoUrl} onChange={(e) => set('logoUrl', e.target.value)} type="url" placeholder="https://" />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Contact Name" required>
            <Input value={form.contactName} onChange={(e) => set('contactName', e.target.value)} required />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Contact Email" required>
              <Input value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} type="email" required />
            </FormField>
            <FormField label="Contact Phone">
              <Input value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>{submitLabel}</Button>
      </div>
    </form>
  );
}
