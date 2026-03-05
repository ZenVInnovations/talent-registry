'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { placementsApi } from '@/lib/api/placements';
import { useUIStore } from '@/stores/ui.store';

export function usePlacements(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['placements', params],
    queryFn: () => placementsApi.list(params),
  });
}

export function useCreatePlacement() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  return useMutation({
    mutationFn: placementsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placements'] });
      addToast({ title: 'Placement recorded', variant: 'success' });
    },
    onError: () => addToast({ title: 'Failed to record placement', variant: 'error' }),
  });
}
