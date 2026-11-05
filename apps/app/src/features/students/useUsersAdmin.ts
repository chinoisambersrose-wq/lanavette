import type { Role } from 'shared';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient.js';
import type { AdminUser } from '../../types/admin.js';

export function useUsersAdmin(role?: Role) {
  return useQuery({
    queryKey: ['admin', 'users', role ?? 'all'],
    queryFn: () => apiClient.get<AdminUser[]>(`/admin/users${role ? `?role=${role}` : ''}`),
  });
}
