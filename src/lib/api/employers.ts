import { api } from './client';
import { PaginatedResult } from '@/types';

export interface Employer {
  id: string;
  companyName: string;
  companySector: string;
  companySize: string;
  website: string | null;
  logoUrl: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  verificationStatus: string;
  bdAssigneeUserId: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { jobs: number; members: number };
}

export interface EmployerFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const employersApi = {
  list: (filters: EmployerFilters = {}) =>
    api.get<PaginatedResult<Employer>>('/api/employers', { params: filters as Record<string, string | number | boolean | undefined> }),
  get: (id: string) => api.get<Employer>(`/api/employers/${id}`),
  create: (data: Partial<Employer>) => api.post<Employer>('/api/employers', data),
  update: (id: string, data: Partial<Employer>) => api.patch<Employer>(`/api/employers/${id}`, data),
  verify: (id: string, data: { status: 'APPROVED' | 'REJECTED'; bdAssigneeUserId?: string }) =>
    api.post<Employer>(`/api/employers/${id}`, { action: 'verify', ...data }),
  delete: (id: string) => api.delete(`/api/employers/${id}`),
};
