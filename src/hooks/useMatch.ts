'use client';

import { useQuery } from '@tanstack/react-query';
import { matchApi } from '@/lib/api/match';

export function useMatch(jobId: string, profileId: string) {
  return useQuery({
    queryKey: ['match', jobId, profileId],
    queryFn: () => matchApi.compute(jobId, profileId),
    enabled: !!jobId && !!profileId,
    staleTime: 5 * 60 * 1000,
  });
}
