import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { logger } from '../logger';

type JsonValue = Prisma.InputJsonValue;

export interface AuditEntry {
  eventType: string;
  entityType: string;
  entityId: string;
  actorUserId?: string | null;
  actorRole?: string | null;
  actorIp?: string | null;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  correlationId?: string | null;
}

export const AuditService = {
  async log(entry: AuditEntry): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          eventType: entry.eventType,
          entityType: entry.entityType,
          entityId: entry.entityId,
          actorUserId: entry.actorUserId ?? null,
          actorRole: entry.actorRole ?? null,
          actorIp: entry.actorIp ?? null,
          beforeState: (entry.beforeState as JsonValue) ?? undefined,
          afterState: (entry.afterState as JsonValue) ?? undefined,
          metadata: (entry.metadata as JsonValue) ?? undefined,
          correlationId: entry.correlationId ?? null,
        },
      });
    } catch (error) {
      logger.error({ error, entry }, 'Failed to write audit log');
    }
  },

  async logMany(entries: AuditEntry[]): Promise<void> {
    try {
      await prisma.auditLog.createMany({
        data: entries.map((e) => ({
          eventType: e.eventType,
          entityType: e.entityType,
          entityId: e.entityId,
          actorUserId: e.actorUserId ?? null,
          actorRole: e.actorRole ?? null,
          actorIp: e.actorIp ?? null,
          beforeState: (e.beforeState as JsonValue) ?? undefined,
          afterState: (e.afterState as JsonValue) ?? undefined,
          metadata: (e.metadata as JsonValue) ?? undefined,
          correlationId: e.correlationId ?? null,
        })),
      });
    } catch (error) {
      logger.error({ error }, 'Failed to write bulk audit logs');
    }
  },

  async query(params: {
    entityType?: string;
    entityId?: string;
    actorUserId?: string;
    eventType?: string;
    from?: Date;
    to?: Date;
    page?: number;
    limit?: number;
  }) {
    const {
      entityType,
      entityId,
      actorUserId,
      eventType,
      from,
      to,
      page = 1,
      limit = 50,
    } = params;

    const where: Record<string, unknown> = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (actorUserId) where.actorUserId = actorUserId;
    if (eventType) where.eventType = eventType;
    if (from || to) {
      where.createdAt = {};
      if (from) (where.createdAt as Record<string, Date>).gte = from;
      if (to) (where.createdAt as Record<string, Date>).lte = to;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};
