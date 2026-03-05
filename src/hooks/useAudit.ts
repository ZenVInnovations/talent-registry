'use client';

import { useQuery } from '@tanstack/react-query';
import { auditApi, type AuditFilters } from '@/lib/api/audit';

export function useAuditLogs(filters: AuditFilters = {}) {
  return useQuery({
    queryKey: ['audit', filters],
    queryFn: () => auditApi.list(filters),
  });
}
