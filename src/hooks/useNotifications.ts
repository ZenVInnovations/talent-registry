'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api/notifications';

export function useNotifications(params: { page?: number; limit?: number; read?: boolean } = {}) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationsApi.list(params),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', { read: false, limit: 1 }],
    queryFn: () => notificationsApi.list({ read: false, limit: 1 }),
    select: (data) => data.pagination.total,
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
