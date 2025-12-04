import { BASE_URL } from './base';

export async function apiFetch(path: string, { method = 'GET', body, headers = {} }: {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
} = {}) {
  const opts: RequestInit = {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...headers }
  };
  
  if (body) {
    opts.body = JSON.stringify(body);
  }
  
  const res = await fetch(`${BASE_URL}${path}`, opts);
  const text = await res.text();
  
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch(e) {
    json = text;
  }
  
  if (!res.ok) {
    throw { status: res.status, body: json };
  }
  
  return json;
}
