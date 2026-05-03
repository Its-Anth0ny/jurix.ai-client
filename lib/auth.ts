import { User } from '@/types';

const AUTH_KEY = 'jurix_auth';

interface AuthData {
  token: string;
  user: User;
}

export function getAuth(): AuthData | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(AUTH_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setAuth(data: AuthData): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function getToken(): string | null {
  const auth = getAuth();
  return auth?.token ?? null;
}

export function getCurrentUser(): User | null {
  const auth = getAuth();
  return auth?.user ?? null;
}
