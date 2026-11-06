import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient.js';
import type { AvailabilityPeriod } from '../../types/instructor.js';

const KEY = ['instructor', 'availability'];

export function useAvailability() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => apiClient.get<AvailabilityPeriod[]>('/instructor/availability'),
  });
}

export function useUpdateAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (disponibilites: AvailabilityPeriod[]) =>
      apiClient.put<AvailabilityPeriod[]>('/instructor/availability', { disponibilites }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
