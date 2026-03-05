'use client';

import { useQuery } from '@tanstack/react-query';
import { jobsApi, type JobFilters } from '@/lib/api/jobs';

export function useEmployerJobs(employerId: string, filters: Omit<JobFilters, 'employerId'> = {}) {
  return useQuery({
    queryKey: ['jobs', { ...filters, employerId }],
    queryFn: () => jobsApi.list({ ...filters, employerId }),
    enabled: !!employerId,
  });
}
