// Permission string constants organized by module

export const PROFILE = {
  VIEW_OWN: 'profile:view_own',
  UPDATE_OWN: 'profile:update_own',
  VIEW_ALL: 'profile:view_all',
} as const;

export const CONSENT = {
  MANAGE_OWN: 'consent:manage_own',
} as const;

export const APPLICATION = {
  CREATE: 'application:create',
  VIEW_OWN: 'application:view_own',
  WITHDRAW_OWN: 'application:withdraw_own',
  VIEW_OWN_JOBS: 'application:view_own_jobs',
  SHORTLIST: 'application:shortlist',
  OFFER: 'application:offer',
  REJECT: 'application:reject',
  VIEW_METRICS: 'application:view_metrics',
} as const;

export const MATCH = {
  VIEW_OWN: 'match:view_own',
  COMPUTE: 'match:compute',
} as const;

export const PLACEMENT = {
  VIEW_OWN: 'placement:view_own',
  RECORD: 'placement:record',
} as const;

export const JOB = {
  CREATE: 'job:create',
  UPDATE_OWN: 'job:update_own',
  CLOSE_OWN: 'job:close_own',
  VIEW_ALL: 'job:view_all',
} as const;

export const TALENT = {
  BROWSE: 'talent:browse',
} as const;

export const EMPLOYER = {
  VERIFY: 'employer:verify',
  REJECT: 'employer:reject',
  VIEW_ALL: 'employer:view_all',
} as const;

export const PIPELINE = {
  MANAGE: 'pipeline:manage',
} as const;

export const ANALYTICS = {
  VIEW: 'analytics:view',
  EXPORT: 'analytics:export',
} as const;

export const ADMIN = {
  ACCESS: 'admin:access',
  AUDIT_VIEW: 'audit:view',
  RETENTION_CONFIGURE: 'retention:configure',
  USER_MANAGE: 'user:manage',
  SETTINGS_MANAGE: 'settings:manage',
} as const;

// Role → Permission mappings for seeding
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  STUDENT: [
    PROFILE.VIEW_OWN,
    PROFILE.UPDATE_OWN,
    CONSENT.MANAGE_OWN,
    APPLICATION.CREATE,
    APPLICATION.VIEW_OWN,
    APPLICATION.WITHDRAW_OWN,
    MATCH.VIEW_OWN,
    PLACEMENT.VIEW_OWN,
  ],
  EMPLOYER: [
    JOB.CREATE,
    JOB.UPDATE_OWN,
    JOB.CLOSE_OWN,
    TALENT.BROWSE,
    APPLICATION.VIEW_OWN_JOBS,
    APPLICATION.SHORTLIST,
    APPLICATION.OFFER,
    APPLICATION.REJECT,
    PLACEMENT.RECORD,
  ],
  ZENV_BD: [
    EMPLOYER.VERIFY,
    EMPLOYER.REJECT,
    EMPLOYER.VIEW_ALL,
    JOB.VIEW_ALL,
    ANALYTICS.VIEW,
    PIPELINE.MANAGE,
    APPLICATION.VIEW_METRICS,
  ],
  ZENV_ADMIN: [
    // All BD permissions
    EMPLOYER.VERIFY,
    EMPLOYER.REJECT,
    EMPLOYER.VIEW_ALL,
    JOB.VIEW_ALL,
    ANALYTICS.VIEW,
    ANALYTICS.EXPORT,
    PIPELINE.MANAGE,
    APPLICATION.VIEW_METRICS,
    // Admin-specific
    ADMIN.ACCESS,
    ADMIN.AUDIT_VIEW,
    ADMIN.RETENTION_CONFIGURE,
    ADMIN.USER_MANAGE,
    ADMIN.SETTINGS_MANAGE,
    PROFILE.VIEW_ALL,
  ],
};
