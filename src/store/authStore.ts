import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: { name: string; insurer: string } | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: { name: string; insurer: string }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  setAuth: (token, user) => {
    localStorage.setItem('dbs_token', token);
    localStorage.setItem('dbs_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },
  clearAuth: () => {
    localStorage.removeItem('dbs_token');
    localStorage.removeItem('dbs_user');
    set({ token: null, user: null, isAuthenticated: false });
  }
}));

export function hydrateAuth() {
  const token = localStorage.getItem('dbs_token');
  const userJson = localStorage.getItem('dbs_user');
  if (token && userJson) {
    try {
      const user = JSON.parse(userJson);
      useAuthStore.setState({ token, user, isAuthenticated: true });
    } catch {
      useAuthStore.setState({ token: null, user: null, isAuthenticated: false });
    }
  }
}
