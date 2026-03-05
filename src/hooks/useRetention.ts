'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { retentionApi } from '@/lib/api/retention';
import { useUIStore } from '@/stores/ui.store';

export function useRetentionData() {
  return useQuery({
    queryKey: ['retention'],
    queryFn: retentionApi.getConfig,
  });
}

export function useTriggerRetention() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  return useMutation({
    mutationFn: retentionApi.triggerRun,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retention'] });
      addToast({ title: 'Retention job triggered', variant: 'success' });
    },
    onError: () => addToast({ title: 'Failed to trigger retention', variant: 'error' }),
  });
}
