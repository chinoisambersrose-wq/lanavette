import type { DocumentStatus, DocumentType } from 'shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient.js';

export interface MyDocument {
  _id: string;
  type: DocumentType;
  url: string;
  statut: DocumentStatus;
}

const KEY = ['me', 'documents'];

export function useMyDocuments() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => apiClient.get<MyDocument[]>('/me/documents'),
  });
}

export function useUploadMyDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, file }: { type: DocumentType; file: File }) => {
      const formData = new FormData();
      formData.set('type', type);
      formData.set('file', file);
      return apiClient.upload<MyDocument>('/me/documents', formData);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
