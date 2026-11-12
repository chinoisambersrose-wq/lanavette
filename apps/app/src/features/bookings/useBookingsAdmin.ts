import type { ForceBookingExceptionInput, RescheduleBookingInput } from 'shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient.js';
import type { BookingAdmin } from '../../types/admin.js';

const KEY = ['admin', 'bookings'];

export function useBookingsAdmin() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => apiClient.get<BookingAdmin[]>('/admin/bookings'),
  });
}

export function useForceCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ForceBookingExceptionInput }) =>
      apiClient.post<BookingAdmin>(`/admin/bookings/${id}/force-cancel`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useForceRescheduleBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RescheduleBookingInput }) =>
      apiClient.post<BookingAdmin>(`/admin/bookings/${id}/force-reschedule`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
