import { prisma } from '../prisma';
import { UserContext } from '../permissions/types';

interface CachedPermissions {
  permissions: Set<string>;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const permissionCache = new Map<string, CachedPermissions>();

function getCacheKey(userId: string, employerId?: string | null): string {
  return employerId ? `${userId}:${employerId}` : userId;
}

export const AuthorizationService = {
  async getPermissions(
    userId: string,
    employerId?: string | null
  ): Promise<Set<string>> {
    const cacheKey = getCacheKey(userId, employerId);
    const cached = permissionCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.permissions;
    }

    // Query user's memberships → roles → permissions
    const whereClause: Record<string, unknown> = { userId };
    if (employerId) {
      whereClause.OR = [{ employerId }, { employerId: null }];
    }

    const members = await prisma.member.findMany({
      where: whereClause,
      include: {
        memberRoles: {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
          },
        },
      },
    });

    const permissions = new Set<string>();
    for (const member of members) {
      for (const memberRole of member.memberRoles) {
        for (const rp of memberRole.role.permissions) {
          permissions.add(rp.permission);
        }
      }
    }

    permissionCache.set(cacheKey, {
      permissions,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return permissions;
  },

  async can(
    user: UserContext,
    permission: string,
    context?: { employerId?: string }
  ): Promise<boolean> {
    const permissions = await this.getPermissions(user.id, context?.employerId);

    // Direct match
    if (permissions.has(permission)) return true;

    // Wildcard match: "module:*" matches "module:action"
    const [module] = permission.split(':');
    if (permissions.has(`${module}:*`)) return true;

    // Super admin wildcard
    if (permissions.has('*')) return true;

    return false;
  },

  async authorize(
    user: UserContext,
    permission: string,
    context?: { employerId?: string }
  ): Promise<void> {
    const allowed = await this.can(user, permission, context);
    if (!allowed) {
      const { AuthorizationError } = await import('../errors');
      throw new AuthorizationError(
        `Missing permission: ${permission}`
      );
    }
  },

  async checkAll(
    user: UserContext,
    permissions: string[],
    context?: { employerId?: string }
  ): Promise<Record<string, boolean>> {
    const userPerms = await this.getPermissions(user.id, context?.employerId);
    const results: Record<string, boolean> = {};

    for (const perm of permissions) {
      const [module] = perm.split(':');
      results[perm] =
        userPerms.has(perm) ||
        userPerms.has(`${module}:*`) ||
        userPerms.has('*');
    }

    return results;
  },

  async getRoles(userId: string, employerId?: string | null) {
    const whereClause: Record<string, unknown> = { userId };
    if (employerId) {
      whereClause.OR = [{ employerId }, { employerId: null }];
    }

    const members = await prisma.member.findMany({
      where: whereClause,
      include: {
        memberRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    const roles = new Map<string, { id: string; name: string; scope: string }>();
    for (const member of members) {
      for (const memberRole of member.memberRoles) {
        roles.set(memberRole.role.id, {
          id: memberRole.role.id,
          name: memberRole.role.name,
          scope: memberRole.role.scope,
        });
      }
    }

    return Array.from(roles.values());
  },

  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const roles = await this.getRoles(userId);
    return roles.some((r) => r.name === roleName);
  },

  clearCache(userId?: string): void {
    if (userId) {
      for (const key of Array.from(permissionCache.keys())) {
        if (key.startsWith(userId)) {
          permissionCache.delete(key);
        }
      }
    } else {
      permissionCache.clear();
    }
  },
};
