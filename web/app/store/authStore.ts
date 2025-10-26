import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '../config/api';
import type { GameDto } from '../types/game';

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
  userId: string | null;
  userScope: string | null;
  currentGameId: string | null;
  currentGame: GameDto | null;
  setAuthToken: (token: string | null) => void;
  setCurrentGame: (game: GameDto | null) => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
  authToken: null,
  userId: null,
  userScope: null,
  currentGameId: null,
  currentGame: null,

  setAuthToken: (token) => {
    if (token) {
      // Extract userId and scope from JWT token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Client received JWT payload:', payload);
        const userId = payload.sub || payload.userId;
        const userScope = payload.scope;
        console.log('Client extracted:', { userId, userScope });

        set({
          authToken: token,
          userId,
          userScope
        });

        // Load current game from localStorage
        const storageKey = `currentGame_${userId}`;
        const storedGame = localStorage.getItem(storageKey);
        if (storedGame) {
          try {
            const game = JSON.parse(storedGame) as GameDto;
            set({ currentGameId: game.id, currentGame: game });
          } catch (error) {
            console.error('Failed to parse stored game:', error);
            // Clear invalid stored game
            localStorage.removeItem(storageKey);
          }
        }
      } catch (error) {
        console.error('Failed to parse auth token:', error);
        set({ authToken: token });
      }
    } else {
      // Clear current game when logging out
      set({ authToken: null, userId: null, userScope: null, currentGameId: null, currentGame: null });
    }
  },

  setCurrentGame: (game) => {
    const userId = get().userId;
    if (userId && game) {
      const storageKey = `currentGame_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(game));
      set({ currentGameId: game.id, currentGame: game });
    } else if (userId && !game) {
      const storageKey = `currentGame_${userId}`;
      localStorage.removeItem(storageKey);
      set({ currentGameId: null, currentGame: null });
    }
  },

  isAuthenticated: () => !!get().authToken,

  isAdmin: () => {
    const scope = get().userScope;
    return scope === 'admin' || scope === 'ADMIN';
  },

  login: async (email: string, password: string) => {
    const data = await apiRequest<LoginResponse>('/api/authentication/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    get().setAuthToken(data.authToken);
  },

  register: async (email: string, username: string, password: string) => {
    const data = await apiRequest<LoginResponse>('/api/authentication/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
    get().setAuthToken(data.authToken);
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const authToken = get().authToken;
    const requestOptions: any = {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    };
    if (authToken) {
      requestOptions.authToken = authToken;
    }
    await apiRequest('/api/authentication/change-password', requestOptions);
  },
    }),
    {
      name: 'auth-store', // Name for Redux DevTools
      enabled: process.env.NODE_ENV === 'development', // Only enable in development
    }
  )
); 