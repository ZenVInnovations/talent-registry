import { connect, NatsConnection, JetStreamClient, StringCodec } from 'nats';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../logger';
import { DomainEvent } from '@/types';

let nc: NatsConnection | null = null;
let js: JetStreamClient | null = null;
const sc = StringCodec();

async function getConnection(): Promise<{ nc: NatsConnection; js: JetStreamClient }> {
  if (nc && js) return { nc, js };

  const servers = process.env.NATS_URL || 'nats://localhost:4222';

  try {
    nc = await connect({ servers });
    js = nc.jetstream();
    logger.info({ servers }, 'NATS publisher connected');
    return { nc, js };
  } catch (error) {
    logger.error({ error }, 'Failed to connect NATS publisher');
    throw error;
  }
}

export const EventPublisher = {
  async publish<T>(
    subject: string,
    payload: T,
    options: {
      entityType: string;
      entityId: string;
      actorUserId?: string | null;
      correlationId?: string;
      causationId?: string | null;
      version?: number;
    }
  ): Promise<string> {
    const eventId = uuidv4();
    const idempotencyKey = uuidv4();

    const event: DomainEvent<T> = {
      eventId,
      eventType: subject,
      timestamp: new Date().toISOString(),
      actorUserId: options.actorUserId ?? null,
      entityType: options.entityType,
      entityId: options.entityId,
      idempotencyKey,
      correlationId: options.correlationId || uuidv4(),
      causationId: options.causationId ?? null,
      version: options.version ?? 1,
      payload,
    };

    try {
      const { js: jetStream } = await getConnection();
      await jetStream.publish(subject, sc.encode(JSON.stringify(event)));
      logger.info({ subject, eventId, entityId: options.entityId }, 'Event published');
      return eventId;
    } catch (error) {
      logger.error({ error, subject, eventId }, 'Failed to publish event');
      throw error;
    }
  },

  async disconnect(): Promise<void> {
    if (nc) {
      await nc.close();
      nc = null;
      js = null;
      logger.info('NATS publisher disconnected');
    }
  },
};
