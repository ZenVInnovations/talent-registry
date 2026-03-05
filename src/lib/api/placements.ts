import { api } from './client';
import { PaginatedResult } from '@/types';

export interface Placement {
  id: string;
  applicationId: string;
  employerId: string;
  profileId: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string | null;
  sourceOpportunityId: string | null;
  createdAt: string;
  application?: { id: string; job?: { id: string; title: string; employer?: { companyName: string } } };
}

export const placementsApi = {
  list: (params: { page?: number; limit?: number } = {}) =>
    api.get<PaginatedResult<Placement>>('/api/placements', { params: params as Record<string, string | number | boolean | undefined> }),
  create: (data: { applicationId: string; type: string; startDate: string; endDate?: string }) =>
    api.post<Placement>('/api/placements', data),
};
