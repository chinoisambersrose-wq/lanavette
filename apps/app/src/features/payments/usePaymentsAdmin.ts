import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient.js';
import type { PaymentAdmin } from '../../types/admin.js';

export function usePaymentsAdmin() {
  return useQuery({
    queryKey: ['admin', 'payments'],
    queryFn: () => apiClient.get<PaymentAdmin[]>('/admin/payments'),
  });
}
