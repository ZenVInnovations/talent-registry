import { PermissionDefinition } from './types';

const definitions: PermissionDefinition[] = [
  // Profile
  { name: 'profile:view_own', module: 'profile', action: 'view_own', description: 'View own student profile', contexts: ['global'], require: 'authenticated', grantToAdmin: true, dependencies: [], visible: true },
  { name: 'profile:update_own', module: 'profile', action: 'update_own', description: 'Update own student profile', contexts: ['global'], require: 'authenticated', grantToAdmin: true, dependencies: ['profile:view_own'], visible: true },
  { name: 'profile:view_all', module: 'profile', action: 'view_all', description: 'View all student profiles (internal)', contexts: ['global'], require: 'member', grantToAdmin: true, dependencies: [], visible: true },

  // Consent
  { name: 'consent:manage_own', module: 'consent', action: 'manage_own', description: 'Manage own consent settings', contexts: ['global'], require: 'authenticated', grantToAdmin: true, dependencies: [], visible: true },

  // Application
  { name: 'application:create', module: 'application', action: 'create', description: 'Submit job applications', contexts: ['global'], require: 'authenticated', grantToAdmin: true, dependencies: [], visible: true },
  { name: 'application:view_own', module: 'application', action: 'view_own', description: 'View own applications', contexts: ['global'], require: 'authenticated', grantToAdmin: true, dependencies: [], visible: true },
  { name: 'application:withdraw_own', module: 'application', action: 'withdraw_own', description: 'Withdraw own applications', contexts: ['global'], require: 'authenticated', grantToAdmin: true, dependencies: ['application:view_own'], visible: true },
  { name: 'application:view_own_jobs', module: 'application', action: 'view_own_jobs', description: 'View applications for own jobs', contexts: ['employer'], require: 'member', grantToAdmin: true, dependencies: [], visible: true },
  { name: 'application:shortlist', module: 'application', action: 'shortlist', description: 'Shortlist applicants', contexts: ['employer'], require: 'member', grantToAdmin: true, dependencies: ['application:view_own_jobs'], visible: true },
  { name: 'application:offer', module: 'application', action: 'offer', description: 'Extend offers to applicants', contexts: ['employer'], require: 'member', grantToAdmin: true, dependencies: ['application:shortlist'], visible: true },
  { name: 'application:reject', module: 'application', action: 'reject', description: 'Reject applicants', contexts: ['employer'], require: 'member', grantToAdmin: true, dependencies: ['application:view_own_jobs'], visible: true },
  { name: 'application:view_metrics', module: 'application', action: 'view_metrics', description: 'View application metrics', contexts: ['global'], require: 'member', grantToAdmin: true, dependencies: [], visible: true },

  // Match
  { name: 'match:view_own', module: 'match', action: 'view_own', description: 'View own match scores', contexts: ['global'], require: 'authenticated', grantToAdmin: true, dependencies: [], visible: true },
  { name: 'match:compute', module: 'match', action: 'compute', description: 'Trigger match computation', contexts: ['global'], require: 'member', grantToAdmin: true, dependencies: [], visible: true },

  // Placement
  { name: 'placement:view_own', module: 'placement', action: 'view_own', description: 'View own placement records', contexts: ['global'], require: 'authenticated', grantToAdmin: true, dependencies: [], visible: true },
  { name: 'placement:record', module: 'placement', action: 'record', description: 'Record placements', contexts: ['employer'], require: 'member', grantToAdmin: true, dependencies: [], visible: true },

  // Job
  { name: 'job:create', module: 'job', action: 'create', description: 'Create job postings', contexts: ['employer'], require: 'member', grantToAdmin: true, dependencies: [], visible: true },
  { name: 'job:update_own', module: 'job', action: 'update_own', description: 'Update own job postings', contexts: ['employer'], require: 'member', grantToAdmin: true, dependencies: ['job:create'], visible: true },
  { name: 'job:close_own', module: 'job', action: 'close_own', description: 'Close own job postings', contexts: ['employer'], require: 'member', grantToAdmin: true, dependencies: ['job:update_own'], visible: true },
  { name: 'job:view_all', module: 'job', action: 'view_all', description: 'View all job postings', contexts: ['global'], require: 'member', grantToAdmin: true, dependencies: [], visible: true },

  // Talent
  { name: 'talent:browse', module: 'talent', action: 'browse', description: 'Browse anonymized talent pool', contexts: ['employer'], require: 'member', grantToAdmin: true, dependencies: [], visible: true },

  // Employer
  { name: 'employer:verify', module: 'employer', action: 'verify', description: 'Verify employer accounts', contexts: ['global'], require: 'member', grantToAdmin: true, dependencies: ['employer:view_all'], visible: true },
  { name: 'employer:reject', module: 'employer', action: 'reject', description: 'Reject employer accounts', contexts: ['global'], require: 'member', grantToAdmin: true, dependencies: ['employer:view_all'], visible: true },
  { name: 'employer:view_all', module: 'employer', action: 'view_all', description: 'View all employers', contexts: ['global'], require: 'member', grantToAdmin: true, dependencies: [], visible: true },

  // Pipeline
  { name: 'pipeline:manage', module: 'pipeline', action: 'manage', description: 'Manage BD pipeline', contexts: ['global'], require: 'member', grantToAdmin: true, dependencies: [], visible: true },

  // Analytics
  { name: 'analytics:view', module: 'analytics', action: 'view', description: 'View analytics dashboards', contexts: ['global'], require: 'member', grantToAdmin: true, dependencies: [], visible: true },
  { name: 'analytics:export', module: 'analytics', action: 'export', description: 'Export analytics data', contexts: ['global'], require: 'member', grantToAdmin: true, dependencies: ['analytics:view'], visible: true },

  // Admin
  { name: 'admin:access', module: 'admin', action: 'access', description: 'Access admin panel', contexts: ['global'], require: 'member', grantToAdmin: true, dependencies: [], visible: true },
  { name: 'audit:view', module: 'admin', action: 'audit_view', description: 'View audit logs', contexts: ['global'], require: 'member', grantToAdmin: true, dependencies: ['admin:access'], visible: true },
  { name: 'retention:configure', module: 'admin', action: 'retention_configure', description: 'Configure retention policies', contexts: ['global'], require: 'member', grantToAdmin: true, dependencies: ['admin:access'], visible: true },
  { name: 'user:manage', module: 'admin', action: 'user_manage', description: 'Manage user accounts', contexts: ['global'], require: 'member', grantToAdmin: true, dependencies: ['admin:access'], visible: true },
  { name: 'settings:manage', module: 'admin', action: 'settings_manage', description: 'Manage system settings', contexts: ['global'], require: 'member', grantToAdmin: true, dependencies: ['admin:access'], visible: true },
];

class PermissionRegistry {
  private permissions: Map<string, PermissionDefinition>;

  constructor() {
    this.permissions = new Map();
    for (const def of definitions) {
      this.permissions.set(def.name, def);
    }
  }

  get(name: string): PermissionDefinition | undefined {
    return this.permissions.get(name);
  }

  getAll(): PermissionDefinition[] {
    return Array.from(this.permissions.values());
  }

  getByModule(module: string): PermissionDefinition[] {
    return this.getAll().filter((p) => p.module === module);
  }

  exists(name: string): boolean {
    return this.permissions.has(name);
  }

  getAdminPermissions(): string[] {
    return this.getAll()
      .filter((p) => p.grantToAdmin)
      .map((p) => p.name);
  }
}

export const permissionRegistry = new PermissionRegistry();
