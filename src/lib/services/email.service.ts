import nodemailer from 'nodemailer';
import { logger } from '../logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
});

export const EmailService = {
  async send(params: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }): Promise<void> {
    try {
      await transporter.sendMail({
        from: params.from || process.env.EMAIL_FROM || 'noreply@talentregistry.zencube.ai',
        to: params.to,
        subject: params.subject,
        html: params.html,
      });
      logger.info({ to: '[REDACTED]', subject: params.subject }, 'Email sent');
    } catch (error) {
      logger.error({ error, subject: params.subject }, 'Failed to send email');
      throw error;
    }
  },

  async sendApplicationConfirmation(params: {
    studentEmail: string;
    studentName: string;
    jobTitle: string;
    companyName: string;
    applicationId: string;
  }): Promise<void> {
    await this.send({
      to: params.studentEmail,
      subject: `Application Confirmed — ${params.jobTitle} at ${params.companyName}`,
      html: `
        <h2>Application Submitted</h2>
        <p>Hi ${params.studentName},</p>
        <p>Your application for <strong>${params.jobTitle}</strong> at <strong>${params.companyName}</strong> has been submitted successfully.</p>
        <p>You can track your application status in the Talent Registry dashboard.</p>
        <p>— ZenCube Talent Registry</p>
      `,
    });
  },

  async sendStatusChangeNotification(params: {
    email: string;
    name: string;
    jobTitle: string;
    companyName: string;
    newStatus: string;
  }): Promise<void> {
    await this.send({
      to: params.email,
      subject: `Application Update — ${params.jobTitle}`,
      html: `
        <h2>Application Status Update</h2>
        <p>Hi ${params.name},</p>
        <p>Your application for <strong>${params.jobTitle}</strong> at <strong>${params.companyName}</strong> has been updated to: <strong>${params.newStatus}</strong>.</p>
        <p>Log in to the Talent Registry for more details.</p>
        <p>— ZenCube Talent Registry</p>
      `,
    });
  },

  async sendEmployerVerificationNotification(params: {
    email: string;
    companyName: string;
    status: 'APPROVED' | 'REJECTED';
  }): Promise<void> {
    const approved = params.status === 'APPROVED';
    await this.send({
      to: params.email,
      subject: `Employer ${approved ? 'Verified' : 'Application Update'} — ${params.companyName}`,
      html: `
        <h2>Employer ${approved ? 'Verification Approved' : 'Verification Update'}</h2>
        <p>${approved
          ? `Great news! <strong>${params.companyName}</strong> has been verified on ZenCube Talent Registry. You can now post jobs and browse talent.`
          : `We're unable to verify <strong>${params.companyName}</strong> at this time. Please contact our team for more information.`
        }</p>
        <p>— ZenCube Talent Registry</p>
      `,
    });
  },
};
