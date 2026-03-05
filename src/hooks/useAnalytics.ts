'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api/analytics';

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: analyticsApi.summary,
    staleTime: 5 * 60 * 1000,
  });
}

export function useApplicationMetrics() {
  return useQuery({
    queryKey: ['analytics', 'applications'],
    queryFn: analyticsApi.applications,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlacementMetrics() {
  return useQuery({
    queryKey: ['analytics', 'placements'],
    queryFn: analyticsApi.placements,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSkillDemand() {
  return useQuery({
    queryKey: ['analytics', 'skills'],
    queryFn: analyticsApi.skills,
    staleTime: 5 * 60 * 1000,
  });
}
