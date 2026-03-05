import { api } from './client';
import { PaginatedResult } from '@/types';

export interface Job {
  id: string;
  title: string;
  description: string;
  type: string;
  domain: string;
  requiredSkills: string[];
  preferredSkills: string[];
  location: string | null;
  remote: boolean;
  salaryRange: { min: number; max: number; currency: string } | null;
  openPositions: number;
  status: string;
  screeningRequired: boolean;
  closesAt: string | null;
  createdAt: string;
  updatedAt: string;
  employerId: string;
  employer?: { id: string; companyName: string; logoUrl: string | null; verificationStatus: string };
}

export interface JobFilters {
  domain?: string;
  type?: string;
  status?: string;
  employerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const jobsApi = {
  list: (filters: JobFilters = {}) =>
    api.get<PaginatedResult<Job>>('/api/jobs', { params: filters as Record<string, string | number | boolean | undefined> }),
  get: (id: string) => api.get<Job>(`/api/jobs/${id}`),
  create: (data: Partial<Job>) => api.post<Job>('/api/jobs', data),
  update: (id: string, data: Partial<Job>) => api.patch<Job>(`/api/jobs/${id}`, data),
  updateStatus: (id: string, status: string) => api.patch<Job>(`/api/jobs/${id}`, { status }),
  delete: (id: string) => api.delete(`/api/jobs/${id}`),
};
