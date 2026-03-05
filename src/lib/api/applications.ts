import { api } from './client';
import { PaginatedResult } from '@/types';

export interface Application {
  id: string;
  jobId: string;
  profileId: string;
  employerId: string;
  status: string;
  coverLetter: string | null;
  customAnswers: Record<string, string> | null;
  matchScoreAtApply: number | null;
  screeningScore: number | null;
  statusHistory: { status: string; changedBy: string; changedAt: string; reason?: string }[];
  createdAt: string;
  updatedAt: string;
  job?: { id: string; title: string; domain: string; type: string; employer?: { id: string; companyName: string } };
  profile?: { id: string; anonymizedId: string; displayName: string; userId: string };
  placement?: { id: string; status: string; startDate: string } | null;
}

export interface ApplicationFilters {
  status?: string;
  jobId?: string;
  page?: number;
  limit?: number;
}

export const applicationsApi = {
  list: (filters: ApplicationFilters = {}) =>
    api.get<PaginatedResult<Application>>('/api/applications', { params: filters as Record<string, string | number | boolean | undefined> }),
  get: (id: string) => api.get<Application>(`/api/applications/${id}`),
  create: (data: { jobId: string; coverLetter?: string; customAnswers?: Record<string, string> }) =>
    api.post<Application>('/api/applications', data),
  updateStatus: (id: string, status: string, reason?: string) =>
    api.patch<Application>(`/api/applications/${id}`, { status, reason }),
};
