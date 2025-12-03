// src/api/events.ts
import { apiFetch } from './apiClient';
import { Event } from './users';

export interface CreateEventPayload {
  title: string;
  creatorId: number;
  total: number;
  participants: {
    userId: number;
    included: boolean;
  }[];
}

export interface AddDebitorPayload {
  userId: number;
  included: boolean;
  debAmount?: number;
}

export interface DebitorDto {
  id: number;
  userId: number;
  debAmount: number;
  included: boolean;
}

export const listEvents = (): Promise<Event[]> => apiFetch('/api/events');
export const getEvent = (id: number): Promise<Event> => apiFetch(`/api/events/${id}`);
export const createEvent = (payload: CreateEventPayload): Promise<Event> =>
  apiFetch('/api/events', { method: 'POST', body: payload });
export const cancelEvent = (id: number): Promise<Event> =>
  apiFetch(`/api/events/${id}/cancel`, { method: 'POST' });
export const deleteEvent = (id: number): Promise<void> =>
  apiFetch(`/api/events/${id}`, { method: 'DELETE' });

/**
 * Returns the created debitor object (backend responds with { id, userId, debAmount, included }).
 * EventView currently calls loadEvent() after this so it refreshes the event state.
 */
export const addDebitor = (eventId: number, payload: AddDebitorPayload): Promise<DebitorDto> =>
  apiFetch(`/api/events/${eventId}/debitors`, { method: 'POST', body: payload });
