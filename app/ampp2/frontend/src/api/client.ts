import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';
const TOKEN_KEY = 'auth_token';

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: () => void) { onUnauthorized = fn; }

export async function getToken() { return SecureStore.getItemAsync(TOKEN_KEY); }
export async function setToken(t: string) { await SecureStore.setItemAsync(TOKEN_KEY, t); }
export async function clearToken() { await SecureStore.deleteItemAsync(TOKEN_KEY); }

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as any) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  let json: any = null;
  try { json = await res.json(); } catch {}
  if (res.status === 401) { await clearToken(); onUnauthorized?.(); throw new Error(json?.message || 'Unauthorized'); }
  if (!res.ok || (json && json.success === false)) {
    throw new Error(json?.message || `Request failed (${res.status})`);
  }
  return (json?.data ?? json) as T;
}
