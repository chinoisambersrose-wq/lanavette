import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient.js';

export interface MyPayment {
  _id: string;
  bookingId: string;
  montant: number;
  statut: 'en_attente' | 'paye' | 'echoue' | 'remborse';
  prestataire: string;
  numeroFacture?: string;
  payeLe?: string;
  createdAt: string;
}

export function useMyPayments() {
  return useQuery({
    queryKey: ['me', 'payments'],
    queryFn: () => apiClient.get<MyPayment[]>('/me/payments'),
  });
}
