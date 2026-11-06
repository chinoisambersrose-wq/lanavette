import type { AvisFinStage } from 'shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient.js';
import type { Lesson } from '../../types/instructor.js';

export function useBookingLessons(bookingId: string | undefined) {
  return useQuery({
    queryKey: ['instructor', 'bookings', bookingId, 'lessons'],
    queryFn: () => apiClient.get<Lesson[]>(`/instructor/bookings/${bookingId}/lessons`),
    enabled: Boolean(bookingId),
  });
}

export interface CreateLessonInput {
  bookingId: string;
  date: string;
  heures: number;
  competences: string[];
  commentaire?: string;
  presence: 'presente' | 'absente' | 'retard';
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, ...body }: CreateLessonInput) =>
      apiClient.post<Lesson>(`/instructor/bookings/${bookingId}/lessons`, body),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: ['instructor', 'bookings', variables.bookingId, 'lessons'],
      }),
  });
}

export function useSetAvisFinStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, avis }: { bookingId: string; avis: AvisFinStage }) =>
      apiClient.post(`/instructor/bookings/${bookingId}/avis`, { avis }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['instructor', 'sessions'] }),
  });
}
