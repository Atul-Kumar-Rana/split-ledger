import { apiFetch } from './apiClient';

export interface Transaction {
  id: number;
  ts: string;
  fromUser: number;
  toUser: number;
  amount: number;
  eventId: number;
  note?: string;
}

export interface PaymentPayload {
  debitorId: number;
  payerUserId: number;
  amount: number;
}

export const payDebitor = (payload: PaymentPayload): Promise<Transaction> => 
  apiFetch('/api/payments/pay', { method: 'POST', body: payload });

export const listTransactions = (): Promise<Transaction[]> => 
  apiFetch('/api/transactions');

export const listUserTransactions = (userId: number): Promise<Transaction[]> => 
  apiFetch(`/api/users/${userId}/transactions`);
