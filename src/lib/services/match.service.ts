import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { logger } from '../logger';
import { JobRequirements, CandidateProfile, MatchDimensionScore } from '@/types';

type JsonValue = Prisma.InputJsonValue;

const ZENYA_API_URL = process.env.ZENYA_API_URL || 'http://localhost:5055';
const MATCH_SCORE_TTL_DAYS = 7;

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

export const MatchService = {
  async computeMatchScore(
    jobRequirements: JobRequirements,
    candidateProfile: CandidateProfile
  ): Promise<{
    overallScore: number;
    dimensionScores: MatchDimensionScore[];
    explanation: string;
  }> {
    try {
      const response = await fetch(`${ZENYA_API_URL}/api/match/compute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.ZENYA_API_KEY || ''}`,
        },
        body: JSON.stringify({
          jobRequirements,
          candidateProfile,
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new ZenyaClientError(
          `ZenYa match scoring failed: ${response.status}`,
          response.status
        );
      }

      const result = await response.json();
      return {
        overallScore: result.overallScore,
        dimensionScores: result.dimensionScores,
        explanation: result.explanation,
      };
    } catch (error) {
      if (error instanceof ZenyaClientError) throw error;
      logger.error({ error }, 'ZenYa match scoring request failed');
      throw new ZenyaClientError('ZenYa service unavailable', undefined, error);
    }
  },

  async getOrComputeMatchScore(jobId: string, profileId: string) {
    // Check for existing non-stale score
    const existing = await prisma.matchScore.findUnique({
      where: { jobId_profileId: { jobId, profileId } },
    });

    if (existing && !existing.stale && new Date(existing.expiresAt) > new Date()) {
      return existing;
    }

    // Fetch job requirements
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        domain: true,
        requiredSkills: true,
        preferredSkills: true,
        type: true,
      },
    });

    if (!job) throw new Error(`Job ${jobId} not found`);

    // Fetch candidate profile
    const profile = await prisma.studentProfile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        domains: true,
        technologies: true,
        skillScores: true,
        badgeSummary: true,
        projectCount: true,
        certificateCount: true,
      },
    });

    if (!profile) throw new Error(`Profile ${profileId} not found`);

    const jobReq: JobRequirements = {
      jobId: job.id,
      domain: job.domain,
      requiredSkills: job.requiredSkills,
      preferredSkills: job.preferredSkills,
      type: job.type,
    };

    const candidateProf: CandidateProfile = {
      profileId: profile.id,
      domains: profile.domains,
      technologies: profile.technologies,
      skillScores: (profile.skillScores as Record<string, number>) || {},
      badgeSummary: (profile.badgeSummary as Record<string, string>) || {},
      projectCount: profile.projectCount,
      certificateCount: profile.certificateCount,
    };

    try {
      const result = await this.computeMatchScore(jobReq, candidateProf);

      const now = new Date();
      const expiresAt = new Date(now.getTime() + MATCH_SCORE_TTL_DAYS * 24 * 60 * 60 * 1000);

      const matchScore = await prisma.matchScore.upsert({
        where: { jobId_profileId: { jobId, profileId } },
        create: {
          jobId,
          profileId,
          overallScore: result.overallScore,
          dimensionScores: result.dimensionScores as unknown as JsonValue,
          explanation: result.explanation,
          computedAt: now,
          expiresAt,
        },
        update: {
          overallScore: result.overallScore,
          dimensionScores: result.dimensionScores as unknown as JsonValue,
          explanation: result.explanation,
          stale: false,
          computedAt: now,
          expiresAt,
        },
      });

      return matchScore;
    } catch (error) {
      // If ZenYa is unavailable and we have a stale score, return it
      if (existing) {
        logger.warn({ jobId, profileId }, 'Returning stale match score — ZenYa unavailable');
        return { ...existing, stale: true };
      }
      throw error;
    }
  },

  async markStale(jobId?: string, profileId?: string): Promise<number> {
    const where: Record<string, string> = {};
    if (jobId) where.jobId = jobId;
    if (profileId) where.profileId = profileId;

    const result = await prisma.matchScore.updateMany({
      where,
      data: { stale: true },
    });

    return result.count;
  },

  async batchComputeForJob(jobId: string, profileIds: string[]): Promise<void> {
    for (const profileId of profileIds) {
      try {
        await this.getOrComputeMatchScore(jobId, profileId);
      } catch (error) {
        logger.error({ error, jobId, profileId }, 'Batch match scoring failed for profile');
      }
    }
  },

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${ZENYA_API_URL}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};
