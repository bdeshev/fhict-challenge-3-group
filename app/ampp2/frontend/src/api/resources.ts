import { apiFetch } from './client';
import { Profile, Plant, Notification, Settings, SensorReadingResponse, WateringStatus } from '../types';

export const profileApi = {
  get: () => apiFetch<Profile>('/profile'),
  update: (body: Partial<Profile>) => apiFetch<Profile>('/profile', { method: 'PUT', body: JSON.stringify(body) }),
};

export const settingsApi = {
  get: () => apiFetch<Settings>('/settings'),
  update: (body: Partial<Settings>) => apiFetch<Settings>('/settings', { method: 'PUT', body: JSON.stringify(body) }),
};

export const plantsApi = {
  list: () => apiFetch<{ plants: Plant[] }>('/plants'),
  search: (q: string, limit = 50) => apiFetch<{ plants: Plant[] }>(`/plants/search?q=${encodeURIComponent(q)}&limit=${limit}`),
  get: (id: number) => apiFetch<Plant>(`/plants/${id}`),
  create: (body: any) => apiFetch<Plant>('/plants', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: any) => apiFetch<Plant>(`/plants/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: number) => apiFetch<any>(`/plants/${id}`, { method: 'DELETE' }),
  water: (id: number) => apiFetch<any>(`/plants/${id}/water`, { method: 'POST' }),
  history: (id: number) => apiFetch<{ history: any[] }>(`/plants/${id}/history`),
  autoDecision: (id: number) => apiFetch<{ wateringNeeded: boolean }>(`/plants/${id}/auto-decision`),
};

export const notificationsApi = {
  list: () => apiFetch<{ notifications: Notification[] }>('/notifications'),
  markRead: (id: number) => apiFetch<Notification>(`/notifications/${id}/read`, { method: 'PUT' }),
};

export const pushApi = {
  register: (body: { deviceToken: string; platform: string }) =>
    apiFetch<any>('/push/register', { method: 'POST', body: JSON.stringify(body) }),
  remove: (body: { deviceToken: string; platform: string }) =>
    apiFetch<any>('/push/register', { method: 'DELETE', body: JSON.stringify(body) }),
};

export const sensorApi = {
  reading: (body: any) => apiFetch<SensorReadingResponse>('/sensor/reading', { method: 'POST', body: JSON.stringify(body) }),
};

export const wateringApi = {
  status: (body: any) => apiFetch<{ status: WateringStatus }>('/watering/status', { method: 'POST', body: JSON.stringify(body) }),
};
