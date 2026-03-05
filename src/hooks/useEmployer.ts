'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employersApi, type EmployerFilters } from '@/lib/api/employers';
import { useUIStore } from '@/stores/ui.store';

export function useEmployers(filters: EmployerFilters = {}) {
  return useQuery({
    queryKey: ['employers', filters],
    queryFn: () => employersApi.list(filters),
  });
}

export function useEmployer(id: string) {
  return useQuery({
    queryKey: ['employers', id],
    queryFn: () => employersApi.get(id),
    enabled: !!id,
  });
}

export function useCreateEmployer() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  return useMutation({
    mutationFn: employersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employers'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      addToast({ title: 'Company registered successfully!', variant: 'success' });
    },
    onError: () => addToast({ title: 'Failed to register company', variant: 'error' }),
  });
}

export function useUpdateEmployer() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Record<string, unknown>> }) => employersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['employers'] });
      queryClient.invalidateQueries({ queryKey: ['employers', id] });
      addToast({ title: 'Company updated', variant: 'success' });
    },
    onError: () => addToast({ title: 'Failed to update company', variant: 'error' }),
  });
}

export function useVerifyEmployer() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: 'APPROVED' | 'REJECTED'; bdAssigneeUserId?: string } }) =>
      employersApi.verify(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employers'] });
      addToast({ title: 'Employer verification updated', variant: 'success' });
    },
    onError: () => addToast({ title: 'Failed to verify employer', variant: 'error' }),
  });
}
