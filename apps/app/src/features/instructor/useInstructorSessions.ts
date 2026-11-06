import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient.js';
import type { InstructorSession, InstructorStudent } from '../../types/instructor.js';

export function useInstructorSessions() {
  return useQuery({
    queryKey: ['instructor', 'sessions'],
    queryFn: () => apiClient.get<InstructorSession[]>('/instructor/sessions'),
  });
}

export function useSessionStudents(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['instructor', 'sessions', sessionId, 'students'],
    queryFn: () => apiClient.get<InstructorStudent[]>(`/instructor/sessions/${sessionId}/students`),
    enabled: Boolean(sessionId),
  });
}
