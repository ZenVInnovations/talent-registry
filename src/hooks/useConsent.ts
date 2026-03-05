'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consentApi } from '@/lib/api/consent';
import { useUIStore } from '@/stores/ui.store';
import { FieldConsents } from '@/types';

export function useConsent() {
  return useQuery({
    queryKey: ['consent'],
    queryFn: consentApi.get,
  });
}

export function useUpdateConsent() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  return useMutation({
    mutationFn: (data: Partial<FieldConsents>) => consentApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consent'] });
      addToast({ title: 'Consent preferences saved', variant: 'success' });
    },
    onError: () => addToast({ title: 'Failed to update consent', variant: 'error' }),
  });
}
