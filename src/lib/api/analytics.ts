import { api } from './client';

export interface AnalyticsSummary {
  totalApplications: number;
  totalPlacements: number;
  totalJobs: number;
  totalEmployers: number;
  activeJobs: number;
  pendingVerifications: number;
  applicationsByStatus: Record<string, number>;
  placementsByType: Record<string, number>;
}

export interface ApplicationDailyRecord {
  id: string;
  date: string;
  domain: string;
  institution: string;
  count: number;
}

export interface PlacementMonthlyRecord {
  id: string;
  month: string;
  sector: string;
  type: string;
  count: number;
}

export interface SkillDemandRecord {
  id: string;
  weekStart: string;
  skill: string;
  demandCount: number;
  supplyCount: number;
}

export interface FunnelRecord {
  status: string;
  count: number;
}

export const analyticsApi = {
  summary: () => api.get<{ summary: AnalyticsSummary }>('/api/analytics?type=summary').then(r => r.summary),
  applications: () => api.get<{ data: ApplicationDailyRecord[] }>('/api/analytics?type=applications').then(r => r.data),
  placements: () => api.get<{ data: PlacementMonthlyRecord[] }>('/api/analytics?type=placements').then(r => r.data),
  skills: () => api.get<{ data: SkillDemandRecord[] }>('/api/analytics?type=skills').then(r => r.data),
  funnel: () => api.get<{ funnel: FunnelRecord[] }>('/api/analytics?type=funnel').then(r => r.funnel),
};
