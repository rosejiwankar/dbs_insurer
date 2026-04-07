import { AuthUser } from '../store/authStore';

const DEFAULT_API_BASE_URL = 'https://driver-behavior-score.onrender.com';
const apiBaseUrl = (import.meta.env.VITE_DBS_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

export interface LoginResponse {
  email: string;
  name: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  access_expires_in: number;
  refresh_expires_in: number;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthSession {
  token: string;
  refreshToken: string | null;
  user: AuthUser;
}

function toAuthSession(
  data: Partial<LoginResponse> | { detail?: string; message?: string } | null,
  fallbackUsername?: string
): AuthSession {
  if (!data || !('access_token' in data) || typeof data.access_token !== 'string') {
    throw new Error('Login response is missing access token');
  }

  return {
    token: data.access_token,
    refreshToken: 'refresh_token' in data && typeof data.refresh_token === 'string' ? data.refresh_token : null,
    user: {
      name: 'name' in data && typeof data.name === 'string' ? data.name : fallbackUsername || 'User',
      email: 'email' in data && typeof data.email === 'string' ? data.email : fallbackUsername
    }
  };
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = (await response.json().catch(() => null)) as Partial<LoginResponse> | { detail?: string; message?: string } | null;

  if (!response.ok) {
    const message =
      (data && 'detail' in data && typeof data.detail === 'string' && data.detail) ||
      (data && 'message' in data && typeof data.message === 'string' && data.message) ||
      'Login failed';
    throw new Error(message);
  }

  return toAuthSession(data, payload.username);
}

export async function refreshAccessToken(refreshToken: string): Promise<AuthSession> {
  const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refresh_token: refreshToken })
  });

  const data = (await response.json().catch(() => null)) as Partial<LoginResponse> | { detail?: string; message?: string } | null;

  if (!response.ok) {
    const message =
      (data && 'detail' in data && typeof data.detail === 'string' && data.detail) ||
      (data && 'message' in data && typeof data.message === 'string' && data.message) ||
      'Token refresh failed';
    throw new Error(message);
  }

  return toAuthSession(data);
}
