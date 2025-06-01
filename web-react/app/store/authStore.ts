import { create } from 'zustand';
import { apiRequest } from '../config/api';

interface LoginResponse {
  _id: string;
  created: string;
  updated: string;
  username: string;
  email: string;
  scope: string;
  authToken: string;  // just the authentication token, not the whole response
}

interface AuthState {
  authToken: string | null;
  setAuthToken: (token: string | null) => void;
  isAuthenticated: () => boolean;
  login: (email: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  authToken: null,
  setAuthToken: (token) => set({ authToken: token }),
  isAuthenticated: () => !!get().authToken,
  login: async (email: string, password: string) => {
    const data = await apiRequest<LoginResponse>('/api/authentication/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    set({ authToken: data.authToken });
  },
})); 