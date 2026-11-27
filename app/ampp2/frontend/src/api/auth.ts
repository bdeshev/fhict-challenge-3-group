import { apiFetch } from './client';
import { User } from '../types';

export const authApi = {
  register: (body: { username: string; email: string; password: string }) =>
    apiFetch<User>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { identifier?: string; email?: string; username?: string; password: string }) =>
    apiFetch<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => apiFetch<User>('/auth/me'),
};
