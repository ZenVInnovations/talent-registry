'use client';

import { useRouter } from 'next/navigation';
import { useEmployers } from '@/hooks/useEmployer';
import { useCreateJob } from '@/hooks/useJobs';
import { JobForm } from '@/components/employer/job-form';
import type { Job } from '@/lib/api/jobs';

export default function NewJobPage() {
  const router = useRouter();
  const { data: employers } = useEmployers();
  const employer = employers?.data[0];
  const { mutate: createJob, isPending } = useCreateJob();

  const handleSubmit = (data: { title: string; description: string; type: string; domain: string; requiredSkills: string[]; preferredSkills: string[]; location: string; remote: boolean; salaryMin: string; salaryMax: string; salaryCurrency: string; openPositions: string; screeningRequired: boolean; closesAt: string }) => {
    const payload: Partial<Job> = {
      title: data.title,
      description: data.description,
      type: data.type,
      domain: data.domain,
      requiredSkills: data.requiredSkills,
      preferredSkills: data.preferredSkills,
      location: data.location || undefined,
      remote: data.remote,
      openPositions: parseInt(String(data.openPositions)) || 1,
      screeningRequired: data.screeningRequired,
    };
    if (data.salaryMin && data.salaryMax) {
      payload.salaryRange = { min: Number(data.salaryMin), max: Number(data.salaryMax), currency: data.salaryCurrency || 'USD' };
    }
    if (data.closesAt) payload.closesAt = new Date(String(data.closesAt)).toISOString();
    createJob(payload, { onSuccess: () => router.push('/employer/jobs') });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create New Job</h1>
        <p className="text-muted-foreground">Post a new opportunity for {employer?.companyName}</p>
      </div>
      <JobForm onSubmit={handleSubmit} loading={isPending} />
    </div>
  );
}
