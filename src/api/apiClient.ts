import { BASE_URL } from './base';

export async function apiFetch(
  path: string,
  { method = 'GET', body, headers = {} }: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
) {
  const token = localStorage.getItem('token'); // ⬅️ read JWT

  const authHeaders: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }   // ⬅️ attach JWT
    : {};

  const opts: RequestInit = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...headers,
    },
  };

  if (body) {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, opts);
  const text = await res.text();

  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  if (!res.ok) {
    throw { status: res.status, body: json };
  }

  return json;
}
