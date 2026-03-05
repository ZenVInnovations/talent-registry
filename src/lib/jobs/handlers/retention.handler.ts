import { registerJobHandler } from '../queue';
import { RetentionService } from '../../services/retention.service';
import { logger } from '../../logger';

export const RETENTION_JOB_TYPE = 'retention:daily_purge';

export function registerRetentionHandler(): void {
  registerJobHandler(RETENTION_JOB_TYPE, async () => {
    logger.info('Retention job started');
    await RetentionService.runFullPipeline();
    logger.info('Retention job completed');
  });
}
