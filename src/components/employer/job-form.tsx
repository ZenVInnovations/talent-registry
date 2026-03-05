'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { FormField } from '@/components/ui/form-field';
import { MultiSelect } from '@/components/ui/multi-select';
import { StepIndicator } from '@/components/ui/step-indicator';
import { Toggle } from '@/components/ui/toggle';
import { Card, CardContent } from '@/components/ui/card';
import { JOB_TYPE_LABELS } from '@/lib/constants';

const STEPS = ['Basic Info', 'Skills', 'Details', 'Review'];
const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'Go', 'Rust',
  'SQL', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Git',
  'Machine Learning', 'Data Analysis', 'UI/UX Design', 'REST APIs', 'GraphQL',
];
const DOMAINS = [
  'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
  'Cloud Computing', 'Cybersecurity', 'DevOps', 'UI/UX Design',
];

interface JobFormData {
  title: string;
  description: string;
  type: string;
  domain: string;
  requiredSkills: string[];
  preferredSkills: string[];
  location: string;
  remote: boolean;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  openPositions: string;
  screeningRequired: boolean;
  closesAt: string;
}

interface JobFormProps {
  initialData?: Partial<JobFormData>;
  onSubmit: (data: JobFormData) => void;
  loading?: boolean;
}

export function JobForm({ initialData = {}, onSubmit, loading }: JobFormProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<JobFormData>({
    title: '', description: '', type: '', domain: '',
    requiredSkills: [], preferredSkills: [],
    location: '', remote: false,
    salaryMin: '', salaryMax: '', salaryCurrency: 'USD',
    openPositions: '1', screeningRequired: false, closesAt: '',
    ...initialData,
  });

  const set = <K extends keyof JobFormData>(key: K, value: JobFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canNext = () => {
    if (step === 0) return form.title && form.type && form.domain;
    if (step === 1) return form.requiredSkills.length > 0;
    return true;
  };

  return (
    <div className="space-y-6">
      <StepIndicator steps={STEPS} currentStep={step} />

      {step === 0 && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <FormField label="Job Title" required>
              <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Frontend Developer Intern" />
            </FormField>
            <FormField label="Description" required>
              <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={6} placeholder="Describe the role, responsibilities, and ideal candidate..." />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Job Type" required>
                <Select value={form.type} onChange={(e) => set('type', e.target.value)} options={Object.entries(JOB_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))} placeholder="Select type" />
              </FormField>
              <FormField label="Domain" required>
                <Select value={form.domain} onChange={(e) => set('domain', e.target.value)} options={DOMAINS.map((d) => ({ value: d, label: d }))} placeholder="Select domain" />
              </FormField>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <FormField label="Required Skills" required description="Skills candidates must have">
              <MultiSelect value={form.requiredSkills} onChange={(v) => set('requiredSkills', v)} options={COMMON_SKILLS} placeholder="Add required skills..." />
            </FormField>
            <FormField label="Preferred Skills" description="Nice-to-have skills">
              <MultiSelect value={form.preferredSkills} onChange={(v) => set('preferredSkills', v)} options={COMMON_SKILLS} placeholder="Add preferred skills..." />
            </FormField>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Location">
                <Input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. San Francisco, CA" />
              </FormField>
              <FormField label="Open Positions">
                <Input value={form.openPositions} onChange={(e) => set('openPositions', e.target.value)} type="number" min="1" />
              </FormField>
            </div>
            <Toggle checked={form.remote} onChange={(v) => set('remote', v)} label="Remote" description="This position allows remote work" />
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Salary Min">
                <Input value={form.salaryMin} onChange={(e) => set('salaryMin', e.target.value)} type="number" min="0" placeholder="0" />
              </FormField>
              <FormField label="Salary Max">
                <Input value={form.salaryMax} onChange={(e) => set('salaryMax', e.target.value)} type="number" min="0" placeholder="0" />
              </FormField>
              <FormField label="Currency">
                <Select value={form.salaryCurrency} onChange={(e) => set('salaryCurrency', e.target.value)} options={[{ value: 'USD', label: 'USD' }, { value: 'EUR', label: 'EUR' }, { value: 'GBP', label: 'GBP' }, { value: 'INR', label: 'INR' }]} />
              </FormField>
            </div>
            <FormField label="Application Deadline">
              <Input value={form.closesAt} onChange={(e) => set('closesAt', e.target.value)} type="date" />
            </FormField>
            <Toggle checked={form.screeningRequired} onChange={(v) => set('screeningRequired', v)} label="Screening Required" description="Require candidates to complete a skills screening" />
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <h3 className="font-semibold">Review Your Job Posting</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">Title:</span> {form.title}</div>
              <div><span className="text-muted-foreground">Type:</span> {JOB_TYPE_LABELS[form.type]}</div>
              <div><span className="text-muted-foreground">Domain:</span> {form.domain}</div>
              <div><span className="text-muted-foreground">Location:</span> {form.location || 'Not specified'}{form.remote ? ' (Remote)' : ''}</div>
              <div><span className="text-muted-foreground">Positions:</span> {form.openPositions}</div>
              <div><span className="text-muted-foreground">Screening:</span> {form.screeningRequired ? 'Yes' : 'No'}</div>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Required Skills:</span> {form.requiredSkills.join(', ')}
            </div>
            {form.preferredSkills.length > 0 && (
              <div className="text-sm">
                <span className="text-muted-foreground">Preferred Skills:</span> {form.preferredSkills.join(', ')}
              </div>
            )}
            <div className="text-sm">
              <span className="text-muted-foreground">Description:</span>
              <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{form.description}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
          Previous
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>Next</Button>
        ) : (
          <Button onClick={() => onSubmit(form)} loading={loading}>Create Job</Button>
        )}
      </div>
    </div>
  );
}
