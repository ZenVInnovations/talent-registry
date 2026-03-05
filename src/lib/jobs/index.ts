import { jobQueue, enqueueJob } from './queue';
import { registerRetentionHandler, RETENTION_JOB_TYPE } from './handlers/retention.handler';
import { registerEmailHandlers } from './handlers/email.handler';
import { logger } from '../logger';

export function initializeJobs(): void {
  // Register all handlers
  registerRetentionHandler();
  registerEmailHandlers();

  // Start the queue
  jobQueue.start();

  logger.info('Job queue initialized with all handlers');
}

export async function scheduleRecurringJobs(): Promise<void> {
  // Schedule daily retention job (runs at 02:00 UTC, approximated with delay)
  const now = new Date();
  const nextRun = new Date(now);
  nextRun.setUTCHours(2, 0, 0, 0);
  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }
  const delayMs = nextRun.getTime() - now.getTime();

  await enqueueJob(RETENTION_JOB_TYPE, {}, { delay: delayMs, maxAttempts: 2 });
  logger.info({ nextRunAt: nextRun.toISOString() }, 'Scheduled retention job');
}

export { enqueueJob, jobQueue };
export { EMAIL_JOB_TYPES } from './handlers/email.handler';
export { RETENTION_JOB_TYPE } from './handlers/retention.handler';
