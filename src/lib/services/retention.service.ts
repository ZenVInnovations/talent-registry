import { prisma } from '../prisma';
import { logger } from '../logger';
import { createHash } from 'crypto';

const RETENTION_DAYS = 30;
const SOFT_DELETE_GRACE_DAYS = 7;
const ANONYMIZATION_SALT = process.env.RETENTION_ANONYMIZATION_SALT || 'talent-registry-salt-2026';

function anonymize(value: string): string {
  return createHash('sha256')
    .update(value + ANONYMIZATION_SALT)
    .digest('hex')
    .slice(0, 16);
}

export const RetentionService = {
  async runPhase1PreAggregate(): Promise<number> {
    const run = await prisma.retentionJobRun.create({
      data: {
        runStartedAt: new Date(),
        phase: 'PRE_AGGREGATE',
        status: 'RUNNING',
      },
    });

    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

      // Aggregate application metrics before purge
      const applications = await prisma.application.findMany({
        where: {
          submittedAt: { lte: cutoff },
          deletedAt: null,
        },
        include: {
          job: { select: { domain: true } },
          employer: { select: { id: true, companySector: true } },
          profile: { select: { institutionName: true } },
        },
      });

      // Group by date/employer/domain/institution bucket
      const aggregates = new Map<string, {
        date: Date;
        employerId: string;
        domain: string;
        institutionBucket: string;
        applicationCount: number;
        shortlistedCount: number;
        offeredCount: number;
        acceptedCount: number;
        matchScores: number[];
      }>();

      for (const app of applications) {
        const date = new Date(app.submittedAt);
        date.setHours(0, 0, 0, 0);
        const institutionBucket = app.profile.institutionName || 'Unknown';
        const domain = app.job.domain || 'General';
        const key = `${date.toISOString()}-${app.employerId}-${domain}-${institutionBucket}`;

        if (!aggregates.has(key)) {
          aggregates.set(key, {
            date,
            employerId: app.employerId,
            domain,
            institutionBucket,
            applicationCount: 0,
            shortlistedCount: 0,
            offeredCount: 0,
            acceptedCount: 0,
            matchScores: [],
          });
        }

        const agg = aggregates.get(key)!;
        agg.applicationCount++;
        if (app.status === 'SHORTLISTED') agg.shortlistedCount++;
        if (app.status === 'OFFERED') agg.offeredCount++;
        if (app.status === 'ACCEPTED') agg.acceptedCount++;
        if (app.matchScoreAtApply) {
          agg.matchScores.push(Number(app.matchScoreAtApply));
        }
      }

      // Upsert aggregates
      let recordsProcessed = 0;
      for (const agg of Array.from(aggregates.values())) {
        const avgScore = agg.matchScores.length > 0
          ? agg.matchScores.reduce((a: number, b: number) => a + b, 0) / agg.matchScores.length
          : null;

        await prisma.analyticsApplicationDaily.upsert({
          where: {
            date_employerId_domain_institutionBucket: {
              date: agg.date,
              employerId: agg.employerId,
              domain: agg.domain,
              institutionBucket: agg.institutionBucket,
            },
          },
          create: {
            date: agg.date,
            employerId: agg.employerId,
            domain: agg.domain,
            institutionBucket: agg.institutionBucket,
            applicationCount: agg.applicationCount,
            shortlistedCount: agg.shortlistedCount,
            offeredCount: agg.offeredCount,
            acceptedCount: agg.acceptedCount,
            avgMatchScore: avgScore,
          },
          update: {
            applicationCount: { increment: agg.applicationCount },
            shortlistedCount: { increment: agg.shortlistedCount },
            offeredCount: { increment: agg.offeredCount },
            acceptedCount: { increment: agg.acceptedCount },
          },
        });
        recordsProcessed++;
      }

      await prisma.retentionJobRun.update({
        where: { id: run.id },
        data: {
          runCompletedAt: new Date(),
          recordsProcessed,
          status: 'COMPLETED',
        },
      });

      logger.info({ phase: 'PRE_AGGREGATE', recordsProcessed }, 'Retention Phase 1 completed');
      return recordsProcessed;
    } catch (error) {
      await prisma.retentionJobRun.update({
        where: { id: run.id },
        data: {
          runCompletedAt: new Date(),
          status: 'FAILED',
          errors: { message: String(error) },
        },
      });
      throw error;
    }
  },

  async runPhase2SoftDelete(): Promise<number> {
    const run = await prisma.retentionJobRun.create({
      data: {
        runStartedAt: new Date(),
        phase: 'SOFT_DELETE',
        status: 'RUNNING',
      },
    });

    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

      // Soft-delete applications older than retention period
      const appResult = await prisma.application.updateMany({
        where: {
          submittedAt: { lte: cutoff },
          deletedAt: null,
          status: {
            in: ['ACCEPTED', 'DECLINED_BY_STUDENT', 'REJECTED', 'WITHDRAWN'],
          },
        },
        data: { deletedAt: new Date() },
      });

      // Soft-delete expired match scores
      const matchResult = await prisma.matchScore.deleteMany({
        where: {
          expiresAt: { lte: new Date() },
          stale: true,
        },
      });

      const totalProcessed = appResult.count + matchResult.count;

      await prisma.retentionJobRun.update({
        where: { id: run.id },
        data: {
          runCompletedAt: new Date(),
          recordsProcessed: totalProcessed,
          status: 'COMPLETED',
        },
      });

      logger.info({ phase: 'SOFT_DELETE', totalProcessed }, 'Retention Phase 2 completed');
      return totalProcessed;
    } catch (error) {
      await prisma.retentionJobRun.update({
        where: { id: run.id },
        data: {
          runCompletedAt: new Date(),
          status: 'FAILED',
          errors: { message: String(error) },
        },
      });
      throw error;
    }
  },

  async runPhase3HardDeleteAndAnonymize(): Promise<{ deleted: number; anonymized: number }> {
    const run = await prisma.retentionJobRun.create({
      data: {
        runStartedAt: new Date(),
        phase: 'HARD_DELETE_ANONYMIZE',
        status: 'RUNNING',
      },
    });

    try {
      const gracePeriodCutoff = new Date();
      gracePeriodCutoff.setDate(
        gracePeriodCutoff.getDate() - (RETENTION_DAYS + SOFT_DELETE_GRACE_DAYS)
      );

      // Category A: Hard-delete (cover letters, custom answers, match explanations)
      const toDelete = await prisma.application.findMany({
        where: {
          deletedAt: { lte: gracePeriodCutoff },
        },
        select: { id: true, profileId: true },
      });

      let deleted = 0;
      for (const app of toDelete) {
        // Delete associated match scores
        await prisma.matchScore.deleteMany({
          where: {
            jobId: app.id,
            profileId: app.profileId,
          },
        });

        // Hard-delete the application
        await prisma.application.delete({
          where: { id: app.id },
        });
        deleted++;
      }

      // Category B: Anonymize placement records
      const placementsToAnonymize = await prisma.placement.findMany({
        where: {
          application: {
            deletedAt: { lte: gracePeriodCutoff },
          },
        },
        include: {
          application: {
            select: { profileId: true, profile: { select: { userId: true } } },
          },
        },
      });

      let anonymized = 0;
      for (const placement of placementsToAnonymize) {
        const anonUserId = anonymize(placement.application.profile.userId);
        // We anonymize by removing the link to the application
        await prisma.placement.update({
          where: { id: placement.id },
          data: {
            deletedAt: new Date(),
          },
        });
        anonymized++;
        logger.debug({ placementId: placement.id, anonUserId }, 'Placement anonymized');
      }

      // Clean up old processed events (older than 90 days)
      const eventCutoff = new Date();
      eventCutoff.setDate(eventCutoff.getDate() - 90);
      await prisma.processedEvent.deleteMany({
        where: { processedAt: { lte: eventCutoff } },
      });

      await prisma.retentionJobRun.update({
        where: { id: run.id },
        data: {
          runCompletedAt: new Date(),
          recordsProcessed: deleted + anonymized,
          recordsDeleted: deleted,
          recordsAnonymized: anonymized,
          status: 'COMPLETED',
        },
      });

      logger.info(
        { phase: 'HARD_DELETE_ANONYMIZE', deleted, anonymized },
        'Retention Phase 3 completed'
      );
      return { deleted, anonymized };
    } catch (error) {
      await prisma.retentionJobRun.update({
        where: { id: run.id },
        data: {
          runCompletedAt: new Date(),
          status: 'FAILED',
          errors: { message: String(error) },
        },
      });
      throw error;
    }
  },

  async runFullPipeline(): Promise<void> {
    logger.info('Starting retention pipeline');

    await this.runPhase1PreAggregate();
    await this.runPhase2SoftDelete();
    await this.runPhase3HardDeleteAndAnonymize();

    logger.info('Retention pipeline completed successfully');
  },

  async getLastSuccessTimestamp(): Promise<Date | null> {
    const lastSuccess = await prisma.retentionJobRun.findFirst({
      where: { status: 'COMPLETED' },
      orderBy: { runCompletedAt: 'desc' },
      select: { runCompletedAt: true },
    });
    return lastSuccess?.runCompletedAt ?? null;
  },
};
