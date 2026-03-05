'use client';

import { useQuery } from '@tanstack/react-query';
import { rolesApi } from '@/lib/api/roles';

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.list,
  });
}
