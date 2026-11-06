import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient.js';
import type { HoursSummary } from '../../types/instructor.js';

export function useHoursSummary(month: string) {
  return useQuery({
    queryKey: ['instructor', 'hours-summary', month],
    queryFn: () => apiClient.get<HoursSummary>(`/instructor/hours-summary?month=${month}`),
  });
}
