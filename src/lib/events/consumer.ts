import {
  connect,
  NatsConnection,
  JetStreamClient,
  JetStreamManager,
  StringCodec,
  AckPolicy,
  DeliverPolicy,
  JsMsg,
} from 'nats';
import { prisma } from '../prisma';
import { logger } from '../logger';
import { DomainEvent } from '@/types';
import { CONSUMER_GROUP, CONSUMER_CONFIG, STREAM_CONFIGS, STREAMS, SUBJECTS } from './types';

const sc = StringCodec();

type EventHandler = (event: DomainEvent) => Promise<void>;

let nc: NatsConnection | null = null;
let js: JetStreamClient | null = null;
let jsm: JetStreamManager | null = null;

const handlers = new Map<string, EventHandler>();

// Redis-like in-memory idempotency check (fallback when Redis unavailable)
const idempotencyCache = new Map<string, number>();
const IDEMP_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

function cleanupIdempotencyCache(): void {
  const now = Date.now();
  for (const [key, expiresAt] of idempotencyCache) {
    if (expiresAt < now) {
      idempotencyCache.delete(key);
    }
  }
}

// Clean up every 10 minutes
setInterval(cleanupIdempotencyCache, 10 * 60 * 1000);

async function checkIdempotency(idempotencyKey: string): Promise<boolean> {
  const cacheKey = `${CONSUMER_GROUP}:${idempotencyKey}`;

  // Fast path: in-memory check
  if (idempotencyCache.has(cacheKey)) {
    return true; // Already processed
  }

  // Durable path: DB check
  try {
    const existing = await prisma.processedEvent.findUnique({
      where: {
        consumerGroup_idempotencyKey: {
          consumerGroup: CONSUMER_GROUP,
          idempotencyKey,
        },
      },
    });

    if (existing) {
      idempotencyCache.set(cacheKey, Date.now() + IDEMP_TTL_MS);
      return true; // Already processed
    }
  } catch (error) {
    logger.warn({ error }, 'DB idempotency check failed, proceeding');
  }

  return false; // Not processed yet
}

async function markProcessed(idempotencyKey: string, eventType: string): Promise<void> {
  const cacheKey = `${CONSUMER_GROUP}:${idempotencyKey}`;
  idempotencyCache.set(cacheKey, Date.now() + IDEMP_TTL_MS);

  try {
    await prisma.processedEvent.create({
      data: {
        consumerGroup: CONSUMER_GROUP,
        idempotencyKey,
        eventType,
      },
    });
  } catch (error) {
    // Unique constraint violation = already processed (race condition), safe to ignore
    logger.debug({ error, idempotencyKey }, 'ProcessedEvent insert race condition (safe)');
  }
}

async function processMessage(msg: JsMsg): Promise<void> {
  const data = sc.decode(msg.data);
  let event: DomainEvent;

  try {
    event = JSON.parse(data);
  } catch {
    logger.error({ subject: msg.subject }, 'Failed to parse event JSON');
    msg.ack(); // Don't retry unparseable messages
    return;
  }

  // Idempotency check
  const isDuplicate = await checkIdempotency(event.idempotencyKey);
  if (isDuplicate) {
    logger.debug({ eventId: event.eventId, subject: msg.subject }, 'Duplicate event, skipping');
    msg.ack();
    return;
  }

  // Find handler
  const handler = handlers.get(event.eventType) || handlers.get(msg.subject);
  if (!handler) {
    logger.warn({ subject: msg.subject, eventType: event.eventType }, 'No handler for event');
    msg.ack();
    return;
  }

  try {
    await handler(event);
    await markProcessed(event.idempotencyKey, event.eventType);
    msg.ack();
    logger.info(
      { eventId: event.eventId, eventType: event.eventType },
      'Event processed successfully'
    );
  } catch (error) {
    logger.error(
      { error, eventId: event.eventId, eventType: event.eventType },
      'Event processing failed'
    );

    // Check if max deliveries reached
    if ((msg.info as unknown as Record<string, unknown>).numDelivered as number >= CONSUMER_CONFIG.maxDeliver) {
      // Publish to DLQ
      try {
        if (js) {
          await js.publish(
            `dlq.${msg.subject}`,
            sc.encode(data)
          );
          logger.warn({ eventId: event.eventId }, 'Event sent to DLQ');
        }
      } catch (dlqError) {
        logger.error({ error: dlqError }, 'Failed to publish to DLQ');
      }
      msg.ack(); // Acknowledge to prevent infinite redelivery
    } else {
      msg.nak(); // Negative acknowledge for retry
    }
  }
}

export const EventConsumer = {
  registerHandler(subject: string, handler: EventHandler): void {
    handlers.set(subject, handler);
    logger.info({ subject }, 'Event handler registered');
  },

  async start(): Promise<void> {
    const servers = process.env.NATS_URL || 'nats://localhost:4222';

    try {
      nc = await connect({ servers });
      js = nc.jetstream();
      jsm = await nc.jetstreamManager();
      logger.info({ servers }, 'NATS consumer connected');
    } catch (error) {
      logger.error({ error }, 'Failed to connect NATS consumer');
      return;
    }

    // Ensure streams exist
    for (const [streamName, config] of Object.entries(STREAM_CONFIGS)) {
      try {
        await jsm.streams.add({
          name: streamName,
          subjects: [...config.subjects],
          max_age: config.maxAge,
          retention: 'limits' as unknown as undefined,
        });
        logger.info({ stream: streamName }, 'Stream ensured');
      } catch (error) {
        // Stream might already exist
        logger.debug({ error, stream: streamName }, 'Stream add result');
      }
    }

    // Subscribe to inbound streams
    const inboundStreams = [STREAMS.ZENCUBE, STREAMS.CHALLENGE, STREAMS.ZENYA];

    for (const streamName of inboundStreams) {
      const config = STREAM_CONFIGS[streamName];

      for (const subjectPattern of config.subjects) {
        try {
          const consumerName = `${CONSUMER_GROUP}-${subjectPattern.replace(/\./g, '-').replace(/\*/g, 'all')}`;

          // Create durable consumer
          await jsm.consumers.add(streamName, {
            durable_name: consumerName,
            ack_policy: AckPolicy.Explicit,
            deliver_policy: DeliverPolicy.Last,
            ack_wait: CONSUMER_CONFIG.ackWait,
            max_deliver: CONSUMER_CONFIG.maxDeliver,
            filter_subject: subjectPattern,
          });

          // Subscribe
          const consumer = await js.consumers.get(streamName, consumerName);
          const messages = await consumer.consume();

          // Process messages asynchronously
          (async () => {
            for await (const msg of messages) {
              await processMessage(msg);
            }
          })().catch((err) => {
            logger.error({ error: err, stream: streamName, subject: subjectPattern }, 'Consumer loop error');
          });

          logger.info({ stream: streamName, subject: subjectPattern, consumer: consumerName }, 'Consumer subscribed');
        } catch (error) {
          logger.error({ error, stream: streamName, subject: subjectPattern }, 'Failed to subscribe');
        }
      }
    }
  },

  async stop(): Promise<void> {
    if (nc) {
      await nc.close();
      nc = null;
      js = null;
      jsm = null;
      logger.info('NATS consumer disconnected');
    }
  },
};

// ── Register domain event handlers ──

import {
  handleZenCubeUserUpdated,
  handleZenCubeProjectCompleted,
  handleChallengeOpportunityCreated,
  handleChallengeCertificateIssued,
  handleChallengePortfolioAccepted,
  handleZenYaSkillScored,
  handleZenYaBadgeAwarded,
  handleZenYaScreeningCompleted,
} from './handlers';

export function registerEventHandlers(): void {
  EventConsumer.registerHandler(SUBJECTS.ZENCUBE_USER_UPDATED, handleZenCubeUserUpdated);
  EventConsumer.registerHandler(SUBJECTS.ZENCUBE_PROJECT_COMPLETED, handleZenCubeProjectCompleted);
  EventConsumer.registerHandler(SUBJECTS.CHALLENGE_OPPORTUNITY_CREATED, handleChallengeOpportunityCreated);
  EventConsumer.registerHandler(SUBJECTS.CHALLENGE_CERTIFICATE_ISSUED, handleChallengeCertificateIssued);
  EventConsumer.registerHandler(SUBJECTS.CHALLENGE_PORTFOLIO_ACCEPTED, handleChallengePortfolioAccepted);
  EventConsumer.registerHandler(SUBJECTS.ZENYA_SKILL_SCORED, handleZenYaSkillScored);
  EventConsumer.registerHandler(SUBJECTS.ZENYA_BADGE_AWARDED, handleZenYaBadgeAwarded);
  EventConsumer.registerHandler(SUBJECTS.ZENYA_SCREENING_COMPLETED, handleZenYaScreeningCompleted);
}
