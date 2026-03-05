import { logger } from '../logger';
import { v4 as uuidv4 } from 'uuid';

export interface Job<T = unknown> {
  id: string;
  type: string;
  payload: T;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: unknown;
}

export interface JobOptions {
  maxAttempts?: number;
  delay?: number;
  priority?: number;
}

type JobHandler<T = unknown> = (payload: T) => Promise<unknown>;

const DEFAULT_CONFIG = {
  concurrency: 3,
  pollInterval: 1000,
  defaultMaxAttempts: 3,
};

class JobQueue {
  private queue: Job[] = [];
  private handlers = new Map<string, JobHandler>();
  private processing = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private started = false;

  registerHandler<T>(type: string, handler: JobHandler<T>): void {
    this.handlers.set(type, handler as JobHandler);
    logger.info({ jobType: type }, 'Job handler registered');
  }

  async enqueue<T>(type: string, payload: T, options: JobOptions = {}): Promise<string> {
    const id = uuidv4();
    const now = new Date();
    const scheduledAt = options.delay
      ? new Date(now.getTime() + options.delay)
      : now;

    const job: Job<T> = {
      id,
      type,
      payload,
      status: 'pending',
      attempts: 0,
      maxAttempts: options.maxAttempts ?? DEFAULT_CONFIG.defaultMaxAttempts,
      createdAt: now,
      scheduledAt,
    };

    this.queue.push(job as Job);

    // Sort by priority (higher first) then by scheduledAt
    if (options.priority) {
      this.queue.sort((a, b) => {
        const pa = (a as Job & { priority?: number }).priority ?? 0;
        const pb = (b as Job & { priority?: number }).priority ?? 0;
        return pb - pa;
      });
    }

    logger.debug({ jobId: id, jobType: type }, 'Job enqueued');
    return id;
  }

  start(): void {
    if (this.started) return;
    this.started = true;

    this.timer = setInterval(() => {
      this.processNext();
    }, DEFAULT_CONFIG.pollInterval);

    logger.info('Job queue started');
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.started = false;
    logger.info('Job queue stopped');
  }

  private async processNext(): Promise<void> {
    if (this.processing >= DEFAULT_CONFIG.concurrency) return;

    const now = new Date();
    const jobIndex = this.queue.findIndex(
      (j) => j.status === 'pending' && j.scheduledAt <= now
    );

    if (jobIndex === -1) return;

    const job = this.queue[jobIndex];
    job.status = 'processing';
    job.startedAt = now;
    job.attempts++;
    this.processing++;

    const handler = this.handlers.get(job.type);
    if (!handler) {
      job.status = 'failed';
      job.error = `No handler registered for job type: ${job.type}`;
      this.processing--;
      logger.error({ jobType: job.type }, 'No handler for job type');
      return;
    }

    try {
      job.result = await handler(job.payload);
      job.status = 'completed';
      job.completedAt = new Date();
      logger.debug({ jobId: job.id, jobType: job.type }, 'Job completed');
    } catch (error) {
      if (job.attempts < job.maxAttempts) {
        job.status = 'pending';
        // Exponential backoff
        const backoffMs = Math.pow(2, job.attempts - 1) * 1000;
        job.scheduledAt = new Date(Date.now() + backoffMs);
        job.error = String(error);
        logger.warn(
          { jobId: job.id, attempt: job.attempts, maxAttempts: job.maxAttempts },
          'Job failed, retrying'
        );
      } else {
        job.status = 'failed';
        job.error = String(error);
        logger.error(
          { jobId: job.id, jobType: job.type, error: String(error) },
          'Job failed permanently'
        );
      }
    } finally {
      this.processing--;
    }

    // Clean up completed/failed jobs older than 1 hour
    const cleanupCutoff = new Date(Date.now() - 60 * 60 * 1000);
    this.queue = this.queue.filter(
      (j) =>
        j.status === 'pending' ||
        j.status === 'processing' ||
        (j.completedAt && j.completedAt > cleanupCutoff)
    );
  }

  getStats(): { pending: number; processing: number; completed: number; failed: number } {
    return {
      pending: this.queue.filter((j) => j.status === 'pending').length,
      processing: this.queue.filter((j) => j.status === 'processing').length,
      completed: this.queue.filter((j) => j.status === 'completed').length,
      failed: this.queue.filter((j) => j.status === 'failed').length,
    };
  }
}

// Singleton
const globalForQueue = globalThis as unknown as {
  jobQueue: JobQueue | undefined;
};

export const jobQueue = globalForQueue.jobQueue ?? new JobQueue();

if (process.env.NODE_ENV !== 'production') {
  globalForQueue.jobQueue = jobQueue;
}

export async function enqueueJob<T>(
  type: string,
  payload: T,
  options?: JobOptions
): Promise<string> {
  return jobQueue.enqueue(type, payload, options);
}

export function registerJobHandler<T>(type: string, handler: JobHandler<T>): void {
  jobQueue.registerHandler(type, handler);
}
