import { api } from './client';

export interface RetentionRun {
  id: string;
  status: string;
  phase: string;
  recordsProcessed: number;
  recordsAnonymized: number;
  recordsDeleted: number;
  errors: string[];
  startedAt: string;
  completedAt: string | null;
}

export interface RetentionConfig {
  retentionDays: number;
  graceDays: number;
  lastRunAt: string | null;
  nextRunAt: string | null;
}

export const retentionApi = {
  getConfig: () => api.get<{ lastSuccessAt: string | null; recentRuns: RetentionRun[] }>('/api/admin/retention'),
  triggerRun: () => api.post<{ message: string; jobId: string }>('/api/admin/retention'),
};
