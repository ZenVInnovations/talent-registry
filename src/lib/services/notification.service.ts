import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';

type JsonValue = Prisma.InputJsonValue;

export const NOTIFICATION_TYPES = {
  APPLICATION_SUBMITTED: 'APPLICATION_SUBMITTED',
  APPLICATION_STATUS_CHANGED: 'APPLICATION_STATUS_CHANGED',
  JOB_POSTED: 'JOB_POSTED',
  EMPLOYER_VERIFIED: 'EMPLOYER_VERIFIED',
  EMPLOYER_REJECTED: 'EMPLOYER_REJECTED',
  MATCH_COMPUTED: 'MATCH_COMPUTED',
  PLACEMENT_RECORDED: 'PLACEMENT_RECORDED',
  CONSENT_UPDATED: 'CONSENT_UPDATED',
  SCREENING_COMPLETED: 'SCREENING_COMPLETED',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  userId: string;
  metadata?: Record<string, unknown>;
}

export const NotificationService = {
  async create(input: CreateNotificationInput) {
    return prisma.notification.create({
      data: {
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link,
        userId: input.userId,
        metadata: (input.metadata as JsonValue) ?? undefined,
      },
    });
  },

  async createBulk(notifications: CreateNotificationInput[]) {
    return prisma.notification.createMany({
      data: notifications.map((n) => ({
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        userId: n.userId,
        metadata: (n.metadata as JsonValue) ?? undefined,
      })),
    });
  },

  async notifyApplicationStatusChange(
    applicationId: string,
    oldStatus: string,
    newStatus: string,
    changedByUserId: string
  ) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        profile: { select: { userId: true, displayName: true } },
        job: { select: { title: true, employerId: true } },
        employer: {
          select: {
            companyName: true,
            members: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!application) return;

    const notifications: CreateNotificationInput[] = [];

    // Notify the student
    if (application.profile.userId !== changedByUserId) {
      notifications.push({
        type: NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED,
        title: 'Application status updated',
        message: `Your application for "${application.job.title}" at ${application.employer.companyName} changed to ${newStatus}`,
        link: `/applications/${applicationId}`,
        userId: application.profile.userId,
        metadata: { applicationId, oldStatus, newStatus },
      });
    }

    // Notify employer members
    for (const member of application.employer.members) {
      if (member.userId !== changedByUserId) {
        notifications.push({
          type: NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED,
          title: 'Application status updated',
          message: `Application from ${application.profile.displayName || 'Candidate'} for "${application.job.title}" changed to ${newStatus}`,
          link: `/employer/applications/${applicationId}`,
          userId: member.userId,
          metadata: { applicationId, oldStatus, newStatus },
        });
      }
    }

    if (notifications.length > 0) {
      await this.createBulk(notifications);
    }
  },

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, read: false },
    });
  },

  async getUserNotifications(params: {
    userId: string;
    read?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { userId, read, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };
    if (read !== undefined) where.read = read;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      data: notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  },

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  },
};
