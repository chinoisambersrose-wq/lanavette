import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient.js';
import type { City } from '../../types/admin.js';
import type { Formula } from '../../types/admin.js';
import type { PublicSession } from '../../types/catalog.js';

export function useFormulasCatalog() {
  return useQuery({
    queryKey: ['catalog', 'formulas'],
    queryFn: () => apiClient.get<Formula[]>('/formulas'),
  });
}

export function useCitiesCatalog() {
  return useQuery({
    queryKey: ['catalog', 'cities'],
    queryFn: () => apiClient.get<City[]>('/cities'),
  });
}

export interface SessionFilters {
  formula?: string;
  city?: string;
  boite?: string;
}

export function useSessionsCatalog(filters: SessionFilters) {
  const params = new URLSearchParams();
  if (filters.formula) params.set('formula', filters.formula);
  if (filters.city) params.set('city', filters.city);
  if (filters.boite) params.set('boite', filters.boite);

  return useQuery({
    queryKey: ['catalog', 'sessions', filters],
    queryFn: () => apiClient.get<PublicSession[]>(`/sessions?${params.toString()}`),
  });
}
