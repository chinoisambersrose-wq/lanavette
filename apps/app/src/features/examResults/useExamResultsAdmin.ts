import type { ExamResultValue } from 'shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient.js';
import type { BookingAdmin, ExamResultAdmin, ExamResultStatsRow } from '../../types/admin.js';

const KEY = ['admin', 'exam-results'];

export function useExamResultsAdmin() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => apiClient.get<ExamResultAdmin[]>('/admin/exam-results'),
  });
}

export function useExamResultStats(groupBy: 'formula' | 'city' | 'instructor') {
  return useQuery({
    queryKey: [...KEY, 'stats', groupBy],
    queryFn: () =>
      apiClient.get<ExamResultStatsRow[]>(`/admin/exam-results/stats?groupBy=${groupBy}`),
  });
}

export function useBookingsAdmin() {
  return useQuery({
    queryKey: ['admin', 'bookings'],
    queryFn: () => apiClient.get<BookingAdmin[]>('/admin/bookings'),
  });
}

export interface CreateExamResultInput {
  bookingId: string;
  examSlotId: string;
  date: string;
  resultat: ExamResultValue;
}

export function useCreateExamResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExamResultInput) =>
      apiClient.post<ExamResultAdmin>('/admin/exam-results', input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
    },
  });
}
