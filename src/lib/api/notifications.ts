import { api } from './client';
import { PaginatedResult } from '@/types';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export const notificationsApi = {
  list: (params: { page?: number; limit?: number; read?: boolean } = {}) =>
    api.get<PaginatedResult<Notification>>('/api/notifications', { params: params as Record<string, string | number | boolean | undefined> }),
  markRead: (id: string) => api.post(`/api/notifications/${id}/read`),
};
