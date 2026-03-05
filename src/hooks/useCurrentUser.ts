'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

interface UserPermissions {
  roles: string[];
  permissions: string[];
}

export function useCurrentUser() {
  const { data: session, status } = useSession();

  const { data: userPermissions } = useQuery({
    queryKey: ['currentUser', 'permissions'],
    queryFn: () => api.get<UserPermissions>('/api/auth/permissions'),
    enabled: status === 'authenticated',
    staleTime: 5 * 60 * 1000,
  });

  const user = session?.user;
  const roles = userPermissions?.roles || [];
  const permissions = userPermissions?.permissions || [];

  function hasRole(role: string): boolean {
    return roles.includes(role);
  }

  function can(permission: string): boolean {
    if (permissions.includes('*')) return true;
    const [module] = permission.split(':');
    return permissions.includes(permission) || permissions.includes(`${module}:*`);
  }

  return {
    user,
    roles,
    permissions,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isStudent: hasRole('STUDENT'),
    isEmployer: hasRole('EMPLOYER'),
    isBD: hasRole('ZENV_BD'),
    isAdmin: hasRole('ZENV_ADMIN'),
    hasRole,
    can,
  };
}
