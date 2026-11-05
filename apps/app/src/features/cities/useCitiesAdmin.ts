import type { CreateCityInput, CreateMeetingPointInput } from 'shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient.js';
import type { City, MeetingPoint } from '../../types/admin.js';

const CITIES_KEY = ['admin', 'cities'];
const MEETING_POINTS_KEY = (citySlug: string) => ['admin', 'meeting-points', citySlug];

export function useCitiesAdmin() {
  return useQuery({ queryKey: CITIES_KEY, queryFn: () => apiClient.get<City[]>('/admin/cities') });
}

export function useCreateCity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCityInput) => apiClient.post<City>('/admin/cities', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CITIES_KEY }),
  });
}

export function useMeetingPointsAdmin(citySlug: string | undefined) {
  return useQuery({
    queryKey: citySlug ? MEETING_POINTS_KEY(citySlug) : ['admin', 'meeting-points', 'none'],
    queryFn: () => apiClient.get<MeetingPoint[]>(`/cities/${citySlug}/meeting-points`),
    enabled: Boolean(citySlug),
  });
}

export function useCreateMeetingPoint(cityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateMeetingPointInput, 'cityId'>) =>
      apiClient.post<MeetingPoint>(`/admin/cities/${cityId}/meeting-points`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'meeting-points'] }),
  });
}

export function useAllMeetingPointsAdmin() {
  return useQuery({
    queryKey: ['admin', 'meeting-points', 'all'],
    queryFn: () => apiClient.get<MeetingPoint[]>('/admin/cities/meeting-points'),
  });
}

export function useDeleteMeetingPoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/cities/meeting-points/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'meeting-points'] }),
  });
}
