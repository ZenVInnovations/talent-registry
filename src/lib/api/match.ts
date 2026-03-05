import { api } from './client';

export interface MatchScore {
  id: string;
  jobId: string;
  profileId: string;
  overallScore: number;
  dimensionScores: { dimension: string; score: number; weight: number; evidence: string }[];
  explanation: string;
  isStale: boolean;
  expiresAt: string;
}

export const matchApi = {
  compute: (jobId: string, profileId: string) =>
    api.post<MatchScore>('/api/match', { jobId, profileId }),
};
