import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient.js';
import type { PublicSession } from '../../types/catalog.js';

export interface MyBooking {
  _id: string;
  sessionId: PublicSession;
  statut: 'en_attente_paiement' | 'confirmee' | 'reportee' | 'annulee' | 'terminee';
  montantTotal: number;
  expireAt?: string;
  createdAt: string;
}

const KEY = ['me', 'bookings'];

export function useMyBookings() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => apiClient.get<MyBooking[]>('/me/bookings'),
  });
}

export function useCreateMyBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => apiClient.post<MyBooking>('/bookings', { sessionId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useCancelMyBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => apiClient.post(`/bookings/${bookingId}/cancel`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useCheckoutMyBooking() {
  return useMutation({
    mutationFn: (bookingId: string) =>
      apiClient.post<{ checkoutUrl: string | null }>(`/bookings/${bookingId}/checkout`),
  });
}
