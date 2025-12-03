// src/api/users.ts
import { apiFetch } from './apiClient';

export interface User {
  id: number;
  username: string;
  email: string;
  total: number;
  debitors?: Debitor[];
  events?: Event[];
}

export interface Debitor {
  id: number;
  debAmount: number;
  amountPaid: number;
  included: boolean;
  settled: boolean;
  eventId: number;
  userId: number;
}

export interface Event {
  id: number;
  title: string;
  createdAt: string;
  total: number;
  cancelled: boolean;
  creatorId: number;
  splits?: Split[];
}

export interface Split {
  id: number;
  userId: number;
  debAmount: number;
  amountPaid: number;
  included: boolean;
  settled: boolean;
}

export const getCurrentUser = (): Promise<User> => apiFetch('/api/users/me');
export const listUsers = (): Promise<User[]> => apiFetch('/api/users');
export const getUser = (id: number): Promise<User> => apiFetch(`/api/users/${id}`);
export const createUser = (payload: Partial<User>): Promise<User> =>
  apiFetch('/api/users', { method: 'POST', body: payload });
export const updateUser = (id: number, payload: Partial<User>): Promise<User> =>
  apiFetch(`/api/users/${id}`, { method: 'PUT', body: payload });
export const deleteUser = (id: number): Promise<void> =>
  apiFetch(`/api/users/${id}`, { method: 'DELETE' });

/**
 * Search user by username.
 * Calls backend: GET /api/users/search?username=...
 * Returns User object or null if not found (404).
 */
export const getUserByUsername = async (username: string): Promise<User | null> => {
  if (!username) return null;
  username = username.trim();
  if (!username) return null;

  // FORCE correct backend host:port here
  const API_BASE = 'http://localhost:8080'; 
  const url = `${API_BASE}/api/users/search?username=${encodeURIComponent(username)}`;

  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Accept': 'application/json' },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to fetch user by username: ${text}`);
  }
  return (await res.json()) as User;
};
