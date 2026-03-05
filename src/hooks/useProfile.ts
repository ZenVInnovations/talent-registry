'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profilesApi } from '@/lib/api/profiles';
import { useUIStore } from '@/stores/ui.store';

export function useProfile(id: string) {
  return useQuery({
    queryKey: ['profiles', id],
    queryFn: () => profilesApi.get(id),
    enabled: !!id,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Record<string, unknown>> }) => profilesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['profiles', id] });
      addToast({ title: 'Profile updated', variant: 'success' });
    },
    onError: () => addToast({ title: 'Failed to update profile', variant: 'error' }),
  });
}
