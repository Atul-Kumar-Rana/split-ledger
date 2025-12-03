import { apiFetch } from './apiClient';
import { Debitor } from './users';

export interface UpdateDebitorPayload {
  amountPaid?: number;
  settled?: boolean;
  included?: boolean;
}

export const updateDebitor = (id: number, payload: UpdateDebitorPayload): Promise<Debitor> => 
  apiFetch(`/api/debitors/${id}`, { method: 'PUT', body: payload });

export const listDebitorsForUser = (userId: number): Promise<Debitor[]> => 
  apiFetch(`/api/users/${userId}/debitors`);
