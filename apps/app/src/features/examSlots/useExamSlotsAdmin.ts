import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient.js';
import type { ExamSlot } from '../../types/admin.js';

const KEY = ['admin', 'exam-slots'];

export interface CreateExamSlotFormInput {
  date: string;
  centreExamen: string;
  placesTotal: number;
  cityId: string;
}

export function useExamSlotsAdmin() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => apiClient.get<ExamSlot[]>('/admin/exam-slots'),
  });
}

export function useCreateExamSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExamSlotFormInput) =>
      apiClient.post<ExamSlot>('/admin/exam-slots', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteExamSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/exam-slots/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
