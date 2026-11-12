import type { Role } from 'shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient.js';
import type { AdminUser } from '../../types/admin.js';

export function useUsersAdmin(role?: Role) {
  return useQuery({
    queryKey: ['admin', 'users', role ?? 'all'],
    queryFn: () => apiClient.get<AdminUser[]>(`/admin/users${role ? `?role=${role}` : ''}`),
  });
}

export function useToggleUserActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, actif }: { id: string; actif: boolean }) =>
      apiClient.patch<AdminUser>(`/admin/users/${id}/active`, { actif }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}
