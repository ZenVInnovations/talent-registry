import { api } from './client';
import { PaginatedResult } from '@/types';

export interface AuditLog {
  id: string;
  eventType: string;
  entityType: string;
  entityId: string;
  actorUserId: string | null;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
  ipAddress: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditFilters {
  entityType?: string;
  entityId?: string;
  actorUserId?: string;
  eventType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const auditApi = {
  list: (filters: AuditFilters = {}) =>
    api.get<PaginatedResult<AuditLog>>('/api/admin/audit', { params: filters as Record<string, string | number | boolean | undefined> }),
};
