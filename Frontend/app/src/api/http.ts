import { API_BASE, AUTH_EXPIRED_EVENT, STORAGE_KEYS } from "../config";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const getToken = () => localStorage.getItem(STORAGE_KEYS.token);
export const setToken = (token: string | null) =>
  token ? localStorage.setItem(STORAGE_KEYS.token, token) : localStorage.removeItem(STORAGE_KEYS.token);

interface Options { method?: string; body?: unknown; form?: FormData; blob?: boolean }

export async function http<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (opts.form) body = opts.form;
  else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }

  const res = await fetch(`${API_BASE}${path}`, { method: opts.method ?? "GET", headers, body });
  if (!res.ok) {
    if (res.status === 401 && token) window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    let message = "Erreur serveur";
    try { message = (await res.json()).message ?? message; } catch { /* réponse non JSON */ }
    throw new ApiError(res.status, message);
  }
  return (opts.blob ? await res.blob() : await res.json()) as T;
}
