import { api } from './client';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  scope: string;
  isDefault: boolean;
  permissions: { id: string; permission: string }[];
  _count?: { memberRoles: number };
}

export const rolesApi = {
  list: () => api.get<{ data: Role[] }>('/api/admin/roles').then(r => r.data),
};
