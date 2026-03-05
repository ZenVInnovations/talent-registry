import { api } from './client';
import { PaginatedResult } from '@/types';

export interface Profile {
  id: string;
  userId: string;
  anonymizedId: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  institutionId: string | null;
  institutionName: string | null;
  domains: string[];
  technologies: string[];
  skillScores: Record<string, number>;
  badgeSummary: Record<string, string>;
  projectCount: number;
  certificateCount: number;
  resumeUrl: string | null;
  profileVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileFilters {
  domain?: string;
  institution?: string;
  skills?: string;
  sortByMatch?: boolean;
  jobId?: string;
  page?: number;
  limit?: number;
}

export const profilesApi = {
  list: (filters: ProfileFilters = {}) =>
    api.get<PaginatedResult<Profile>>('/api/profiles', { params: filters as Record<string, string | number | boolean | undefined> }),
  get: (id: string) => api.get<Profile>(`/api/profiles/${id}`),
  update: (id: string, data: Partial<Profile>) => api.patch<Profile>(`/api/profiles/${id}`, data),
};
