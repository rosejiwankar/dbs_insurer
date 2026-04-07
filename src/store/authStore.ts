import { create } from 'zustand';

export interface AuthUser {
  name: string;
  email?: string;
  insurer?: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthUser, refreshToken?: string | null) => void;
  updateTokens: (token: string, refreshToken?: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  setAuth: (token, user, refreshToken = null) => {
    localStorage.setItem('dbs_token', token);
    if (refreshToken) {
      localStorage.setItem('dbs_refresh_token', refreshToken);
    } else {
      localStorage.removeItem('dbs_refresh_token');
    }
    localStorage.setItem('dbs_user', JSON.stringify(user));
    set({ token, refreshToken, user, isAuthenticated: true });
  },
  updateTokens: (token, refreshToken) => {
    localStorage.setItem('dbs_token', token);
    if (typeof refreshToken === 'string' && refreshToken) {
      localStorage.setItem('dbs_refresh_token', refreshToken);
    }
    set((state) => ({
      token,
      refreshToken: typeof refreshToken === 'string' && refreshToken ? refreshToken : state.refreshToken,
      isAuthenticated: true
    }));
  },
  clearAuth: () => {
    localStorage.removeItem('dbs_token');
    localStorage.removeItem('dbs_refresh_token');
    localStorage.removeItem('dbs_user');
    set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
  }
}));

export function hydrateAuth() {
  const token = localStorage.getItem('dbs_token');
  const refreshToken = localStorage.getItem('dbs_refresh_token');
  const userJson = localStorage.getItem('dbs_user');
  if (token && userJson) {
    try {
      const user = JSON.parse(userJson);
      useAuthStore.setState({ token, refreshToken, user, isAuthenticated: true });
    } catch {
      useAuthStore.setState({ token: null, refreshToken: null, user: null, isAuthenticated: false });
    }
  }
}
