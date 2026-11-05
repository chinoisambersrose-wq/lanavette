import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient.js';
import type { SessionAdmin, SessionDay } from '../../types/admin.js';

const KEY = ['admin', 'sessions'];

export interface CreateSessionFormInput {
  formulaId: string;
  meetingPointId: string;
  instructorId: string;
  examSlotId?: string;
  dates: SessionDay[];
  placesTotal: number;
}

export function useSessionsAdmin() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => apiClient.get<SessionAdmin[]>('/admin/sessions'),
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSessionFormInput) =>
      apiClient.post<SessionAdmin>('/admin/sessions', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDuplicateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<SessionAdmin>(`/admin/sessions/${id}/duplicate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function usePublishSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<SessionAdmin>(`/admin/sessions/${id}/publish`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useCancelSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<SessionAdmin>(`/admin/sessions/${id}/cancel`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
