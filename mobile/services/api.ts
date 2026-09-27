import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'padosipro.authToken';

export type ApiError = { ok: false; error: string; resendInSeconds?: number };

function baseUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (!url) throw new Error('EXPO_PUBLIC_API_URL is not set. Copy mobile/.env.example to .env and set it.');
  return url.replace(/\/$/, '');
}

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string | null): Promise<void> {
  try {
    if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
    else await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // SecureStore can fail on some emulators — auth simply won't persist.
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  let url: string;
  try {
    url = `${baseUrl()}${path}`;
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : 'API URL is not configured.');
  }
  const token = await getToken();
  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection and that the backend is running, then retry.');
  }
  const body = (await res.json().catch(() => ({}))) as T & ApiError;
  if (!res.ok || (body as ApiError).ok === false) {
    const err = new Error((body as ApiError).error || `Request failed (${res.status}). Please try again.`);
    (err as { status?: number; resendInSeconds?: number }).status = res.status;
    (err as { resendInSeconds?: number }).resendInSeconds = (body as ApiError).resendInSeconds;
    throw err;
  }
  return body;
}

export const post = <T,>(path: string, data?: unknown) =>
  api<T>(path, { method: 'POST', body: data ? JSON.stringify(data) : undefined });

export const put = <T,>(path: string, data?: unknown) =>
  api<T>(path, { method: 'PUT', body: data ? JSON.stringify(data) : undefined });

export const get = <T,>(path: string) => api<T>(path);
