// Stream definitions
export const STREAMS = {
  ZENCUBE: 'STREAM_ZENCUBE',
  CHALLENGE: 'STREAM_CHALLENGE',
  TALENT: 'STREAM_TALENT',
  ZENYA: 'STREAM_ZENYA',
  DLQ: 'STREAM_DLQ',
} as const;

// Subject patterns
export const SUBJECTS = {
  // Inbound from Flutto
  ZENCUBE_USER_UPDATED: 'zencube.user.updated',
  ZENCUBE_PROJECT_COMPLETED: 'zencube.project.completed',

  // Inbound from Challenge Registry
  CHALLENGE_OPPORTUNITY_CREATED: 'challenge.opportunity.created',
  CHALLENGE_CERTIFICATE_ISSUED: 'challenge.certificate.issued',
  CHALLENGE_PORTFOLIO_ACCEPTED: 'challenge.portfolio.accepted',

  // Inbound from ZenYa
  ZENYA_SKILL_SCORED: 'zenya.skill.scored',
  ZENYA_BADGE_AWARDED: 'zenya.badge.awarded',
  ZENYA_SCREENING_COMPLETED: 'zenya.screening.completed',

  // Outbound from Talent Registry
  TALENT_PROFILE_CREATED: 'talent.profile.created',
  TALENT_JOB_POSTED: 'talent.job.posted',
  TALENT_APPLICATION_SUBMITTED: 'talent.application.submitted',
  TALENT_APPLICATION_STATUS_CHANGED: 'talent.application.status_changed',
  TALENT_PLACEMENT_RECORDED: 'talent.placement.recorded',
  TALENT_EMPLOYER_VERIFIED: 'talent.employer.verified',
} as const;

// Consumer group name
export const CONSUMER_GROUP = 'talent-registry';

// Stream configurations
export const STREAM_CONFIGS = {
  [STREAMS.ZENCUBE]: {
    subjects: ['zencube.user.*', 'zencube.project.*'],
    maxAge: 30 * 24 * 60 * 60 * 1e9, // 30 days in nanoseconds
  },
  [STREAMS.CHALLENGE]: {
    subjects: ['challenge.opportunity.*', 'challenge.certificate.*', 'challenge.portfolio.*'],
    maxAge: 30 * 24 * 60 * 60 * 1e9,
  },
  [STREAMS.TALENT]: {
    subjects: ['talent.profile.*', 'talent.job.*', 'talent.application.*', 'talent.placement.*', 'talent.employer.*'],
    maxAge: 30 * 24 * 60 * 60 * 1e9,
  },
  [STREAMS.ZENYA]: {
    subjects: ['zenya.skill.*', 'zenya.badge.*', 'zenya.screening.*'],
    maxAge: 14 * 24 * 60 * 60 * 1e9,
  },
  [STREAMS.DLQ]: {
    subjects: ['dlq.*'],
    maxAge: 90 * 24 * 60 * 60 * 1e9,
  },
} as const;

// Consumer config
export const CONSUMER_CONFIG = {
  ackWait: 30 * 1e9, // 30 seconds in nanoseconds
  maxDeliver: 5,
  backoff: [2e9, 10e9, 30e9, 120e9], // exponential backoff in nanoseconds
} as const;
