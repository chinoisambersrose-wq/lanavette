import type { CreateFormulaInput, UpdateFormulaInput } from 'shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient.js';
import type { Formula } from '../../types/admin.js';

const KEY = ['admin', 'formulas'];

export function useFormulasAdmin() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => apiClient.get<Formula[]>('/admin/formulas'),
  });
}

export function useCreateFormula() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFormulaInput) => apiClient.post<Formula>('/admin/formulas', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateFormula() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFormulaInput }) =>
      apiClient.patch<Formula>(`/admin/formulas/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useArchiveFormula() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/formulas/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
