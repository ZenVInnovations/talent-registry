import { registerJobHandler } from '../queue';
import { EmailService } from '../../services/email.service';
import { logger } from '../../logger';

export const EMAIL_JOB_TYPES = {
  APPLICATION_CONFIRMATION: 'email:application-confirmation',
  STATUS_CHANGE: 'email:status-change',
  EMPLOYER_VERIFICATION: 'email:employer-verification',
} as const;

interface ApplicationConfirmationPayload {
  studentEmail: string;
  studentName: string;
  jobTitle: string;
  companyName: string;
  applicationId: string;
}

interface StatusChangePayload {
  email: string;
  name: string;
  jobTitle: string;
  companyName: string;
  newStatus: string;
}

interface EmployerVerificationPayload {
  email: string;
  companyName: string;
  status: 'APPROVED' | 'REJECTED';
}

export function registerEmailHandlers(): void {
  registerJobHandler<ApplicationConfirmationPayload>(
    EMAIL_JOB_TYPES.APPLICATION_CONFIRMATION,
    async (payload) => {
      logger.info({ applicationId: payload.applicationId }, 'Sending application confirmation email');
      await EmailService.sendApplicationConfirmation(payload);
    }
  );

  registerJobHandler<StatusChangePayload>(
    EMAIL_JOB_TYPES.STATUS_CHANGE,
    async (payload) => {
      logger.info('Sending status change email');
      await EmailService.sendStatusChangeNotification(payload);
    }
  );

  registerJobHandler<EmployerVerificationPayload>(
    EMAIL_JOB_TYPES.EMPLOYER_VERIFICATION,
    async (payload) => {
      logger.info({ companyName: payload.companyName }, 'Sending employer verification email');
      await EmailService.sendEmployerVerificationNotification(payload);
    }
  );
}
