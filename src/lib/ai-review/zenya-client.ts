import { logger } from '../logger';

const ZENYA_API_URL = process.env.ZENYA_API_URL || 'http://localhost:5055';

export class ZenyaClientError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ZenyaClientError';
  }
}

async function zenyaFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${ZENYA_API_URL}${path}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ZENYA_API_KEY || ''}`,
        ...options.headers,
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new ZenyaClientError(
        `ZenYa API error: ${response.status} - ${text}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ZenyaClientError) throw error;
    logger.error({ error, url }, 'ZenYa API request failed');
    throw new ZenyaClientError('ZenYa service unavailable', undefined, error);
  }
}

export interface SkillAssessmentResult {
  userId: string;
  skills: {
    skillId: string;
    skillName: string;
    category: string;
    score: number;
    confidence: number;
  }[];
  assessedAt: string;
}

export interface MatchScoringResult {
  overallScore: number;
  dimensionScores: {
    dimension: string;
    score: number;
    weight: number;
    evidence: string;
  }[];
  explanation: string;
}

export interface ScreeningTest {
  screeningId: string;
  questions: {
    id: string;
    text: string;
    type: string;
    options?: string[];
    difficulty: string;
  }[];
  totalQuestions: number;
  timeLimit: number;
}

export const ZenyaClient = {
  async assessUserSkills(params: {
    userId: string;
    completedProjectIds: string[];
    certificateIds: string[];
    existingBadgeIds: string[];
  }): Promise<SkillAssessmentResult> {
    return zenyaFetch<SkillAssessmentResult>('/api/skills/assess', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async computeMatchScore(params: {
    jobRequirements: {
      domain: string;
      requiredSkills: string[];
      preferredSkills: string[];
      type: string;
    };
    candidateProfile: {
      domains: string[];
      technologies: string[];
      skillScores: Record<string, number>;
      badgeSummary: Record<string, string>;
      projectCount: number;
      certificateCount: number;
    };
  }): Promise<MatchScoringResult> {
    return zenyaFetch<MatchScoringResult>('/api/match/compute', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async generateScreeningTest(params: {
    skillTaxonomyIds: string[];
    difficulty: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
    questionCount: number;
  }): Promise<ScreeningTest> {
    return zenyaFetch<ScreeningTest>('/api/screening/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async checkHealth(): Promise<boolean> {
    try {
      await fetch(`${ZENYA_API_URL}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      return true;
    } catch {
      return false;
    }
  },
};
