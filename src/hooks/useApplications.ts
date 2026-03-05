'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi, type ApplicationFilters } from '@/lib/api/applications';
import { useUIStore } from '@/stores/ui.store';

export function useApplications(filters: ApplicationFilters = {}) {
  return useQuery({
    queryKey: ['applications', filters],
    queryFn: () => applicationsApi.list(filters),
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: ['applications', id],
    queryFn: () => applicationsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  return useMutation({
    mutationFn: applicationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      addToast({ title: 'Application submitted!', variant: 'success' });
    },
    onError: () => addToast({ title: 'Failed to submit application', variant: 'error' }),
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      applicationsApi.updateStatus(id, status, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['applications', id] });
      addToast({ title: 'Status updated', variant: 'success' });
    },
    onError: () => addToast({ title: 'Failed to update status', variant: 'error' }),
  });
}
