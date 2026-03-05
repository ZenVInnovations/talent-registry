import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';

type JsonValue = Prisma.InputJsonValue;
import { logger } from '../logger';
import { createHash } from 'crypto';
import {
  DomainEvent,
  ZenCubeUserUpdatedPayload,
  ZenCubeProjectCompletedPayload,
  ChallengeOpportunityCreatedPayload,
  ChallengeCertificateIssuedPayload,
  ChallengePortfolioAcceptedPayload,
  ZenYaSkillScoredPayload,
  ZenYaBadgeAwardedPayload,
  ZenYaScreeningCompletedPayload,
} from '@/types';

function generateAnonymizedId(userId: string): string {
  const hash = createHash('sha256').update(userId).digest('hex').slice(0, 8);
  return `TR-${hash}`;
}

// ── ZenCube (Flutto) Handlers ──

export async function handleZenCubeUserUpdated(event: DomainEvent): Promise<void> {
  const payload = event.payload as ZenCubeUserUpdatedPayload;

  await prisma.studentProfile.upsert({
    where: { userId: payload.userId },
    create: {
      userId: payload.userId,
      anonymizedId: generateAnonymizedId(payload.userId),
      displayName: payload.displayName,
      email: payload.email,
      institutionId: payload.institutionId,
      institutionName: payload.institutionName,
    },
    update: {
      displayName: payload.displayName,
      email: payload.email,
      institutionId: payload.institutionId,
      institutionName: payload.institutionName,
    },
  });

  logger.info({ userId: payload.userId }, 'Profile updated from ZenCube user event');
}

export async function handleZenCubeProjectCompleted(event: DomainEvent): Promise<void> {
  const payload = event.payload as ZenCubeProjectCompletedPayload;

  for (const userId of payload.teamMemberUserIds) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (profile) {
      const existingProjectIds = profile.completedProjectIds || [];
      if (!existingProjectIds.includes(payload.projectId)) {
        const updatedDomains = [...new Set([...profile.domains, payload.domain])];
        const updatedTechs = [...new Set([...profile.technologies, ...payload.technologies])];

        await prisma.studentProfile.update({
          where: { userId },
          data: {
            projectCount: { increment: 1 },
            completedProjectIds: [...existingProjectIds, payload.projectId],
            domains: updatedDomains,
            technologies: updatedTechs,
          },
        });
      }
    } else {
      // Create profile if not exists
      await prisma.studentProfile.create({
        data: {
          userId,
          anonymizedId: generateAnonymizedId(userId),
          projectCount: 1,
          completedProjectIds: [payload.projectId],
          domains: [payload.domain],
          technologies: payload.technologies,
        },
      });
    }
  }

  logger.info({ projectId: payload.projectId }, 'Project completion processed');
}

// ── Challenge Registry Handlers ──

export async function handleChallengeOpportunityCreated(event: DomainEvent): Promise<void> {
  const payload = event.payload as ChallengeOpportunityCreatedPayload;

  // Create a DRAFT job from the opportunity (ADR-006)
  await prisma.job.upsert({
    where: {
      // Use sourceOpportunityId to prevent duplicates
      id: `opp-${payload.opportunityId}`, // Will be replaced by actual logic
    },
    create: {
      title: payload.title,
      description: `Opportunity from ${payload.organizationName} via Challenge Registry`,
      type: payload.type === 'INTERNSHIP' ? 'INTERNSHIP' : 'PLACEMENT',
      domain: payload.skillRequirements[0] || 'General',
      requiredSkills: payload.skillRequirements,
      preferredSkills: [],
      openPositions: payload.count,
      status: 'DRAFT',
      sourceOpportunityId: payload.opportunityId,
      screeningSkillIds: [],
      employerId: '', // Will need BD to assign employer
    },
    update: {
      title: payload.title,
      openPositions: payload.count,
    },
  }).catch(async () => {
    // If upsert with placeholder id fails, try creating with auto-generated id
    const existing = await prisma.job.findFirst({
      where: { sourceOpportunityId: payload.opportunityId },
    });
    if (!existing) {
      // We need an employer to create a job — log for BD review
      logger.info(
        { opportunityId: payload.opportunityId, title: payload.title },
        'New opportunity requires BD review — no employer assigned yet'
      );
    }
  });

  logger.info({ opportunityId: payload.opportunityId }, 'Opportunity → draft job processed');
}

export async function handleChallengeCertificateIssued(event: DomainEvent): Promise<void> {
  const payload = event.payload as ChallengeCertificateIssuedPayload;

  await prisma.studentProfile.updateMany({
    where: { userId: payload.userId },
    data: {
      certificateCount: { increment: 1 },
    },
  });

  logger.info({ userId: payload.userId, certificateId: payload.certificateId }, 'Certificate count updated');
}

export async function handleChallengePortfolioAccepted(event: DomainEvent): Promise<void> {
  const payload = event.payload as ChallengePortfolioAcceptedPayload;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: payload.userId },
  });

  if (profile) {
    const updatedDomains = [...new Set([...profile.domains, payload.domain])];
    const updatedTechs = [...new Set([...profile.technologies, ...payload.technologies])];

    await prisma.studentProfile.update({
      where: { userId: payload.userId },
      data: {
        domains: updatedDomains,
        technologies: updatedTechs,
      },
    });
  }

  logger.info(
    { userId: payload.userId, portfolioProjectId: payload.portfolioProjectId },
    'Portfolio project accepted event processed'
  );
}

// ── ZenYa Handlers ──

export async function handleZenYaSkillScored(event: DomainEvent): Promise<void> {
  const payload = event.payload as ZenYaSkillScoredPayload;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: payload.userId },
  });

  if (profile) {
    const existingScores = (profile.skillScores as Record<string, unknown>) || {};
    const updatedScores = {
      ...existingScores,
      [payload.skillName]: {
        score: payload.score,
        confidence: payload.confidence,
        category: payload.skillCategory,
        taxonomyId: payload.skillTaxonomyId,
      },
    };

    await prisma.studentProfile.update({
      where: { userId: payload.userId },
      data: { skillScores: updatedScores as unknown as JsonValue },
    });

    // Mark existing match scores as stale since skills changed
    const { MatchService } = await import('../services/match.service');
    await MatchService.markStale(undefined, profile.id);
  }

  logger.info({ userId: payload.userId, skill: payload.skillName }, 'Skill score updated');
}

export async function handleZenYaBadgeAwarded(event: DomainEvent): Promise<void> {
  const payload = event.payload as ZenYaBadgeAwardedPayload;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: payload.userId },
  });

  if (profile) {
    const existingBadges = (profile.badgeSummary as Record<string, unknown>) || {};
    const updatedBadges = {
      ...existingBadges,
      [payload.badgeId]: {
        name: payload.badgeName,
        tier: payload.badgeTier,
        awardedAt: payload.awardedAt,
      },
    };

    await prisma.studentProfile.update({
      where: { userId: payload.userId },
      data: { badgeSummary: updatedBadges as unknown as JsonValue },
    });
  }

  logger.info({ userId: payload.userId, badge: payload.badgeName }, 'Badge awarded');
}

export async function handleZenYaScreeningCompleted(event: DomainEvent): Promise<void> {
  const payload = event.payload as ZenYaScreeningCompletedPayload;

  // Update application with screening results
  if (payload.jobId) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (profile) {
      await prisma.application.updateMany({
        where: {
          profileId: profile.id,
          screeningId: payload.screeningId,
        },
        data: {
          screeningScore: payload.overallScore,
          status: 'SCREENING_COMPLETED',
          statusHistory: {
            // Append to history — handled via raw update in production
          },
        },
      });
    }
  }

  logger.info(
    { userId: payload.userId, screeningId: payload.screeningId },
    'Screening completed'
  );
}
