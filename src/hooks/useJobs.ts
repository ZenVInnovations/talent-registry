'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi, type JobFilters } from '@/lib/api/jobs';
import { useUIStore } from '@/stores/ui.store';

export function useJobs(filters: JobFilters = {}) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobsApi.list(filters),
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => jobsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  return useMutation({
    mutationFn: jobsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      addToast({ title: 'Job created', variant: 'success' });
    },
    onError: () => addToast({ title: 'Failed to create job', variant: 'error' }),
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Record<string, unknown>> }) => jobsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs', id] });
      addToast({ title: 'Job updated', variant: 'success' });
    },
    onError: () => addToast({ title: 'Failed to update job', variant: 'error' }),
  });
}

export function useUpdateJobStatus() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => jobsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      addToast({ title: 'Job status updated', variant: 'success' });
    },
    onError: () => addToast({ title: 'Failed to update status', variant: 'error' }),
  });
}
