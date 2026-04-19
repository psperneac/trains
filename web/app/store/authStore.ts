import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '../config/api';
import type { GameDto } from '../types/game';
import type { PlayerDto } from '../types/player';
import { useOptionsStore } from './optionsStore';

const AUTH_TOKEN_KEY = 'authToken';

interface LoginResponse {
  _id: string;
  created: string;
  updated: string;
  username: string;
  email: string;
  scope: string;
  authToken: string;
}

interface AuthState {
  authToken: string | null;
  userId: string | null;
  userScope: string | null;
  currentGameId: string | null;
  currentGame: GameDto | null;
  currentPlayerId: string | null;
  currentPlayer: PlayerDto | null;
  setAuthToken: (token: string | null) => void;
  setCurrentGame: (game: GameDto | null) => void;
  setCurrentPlayer: (player: PlayerDto | null) => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
  authToken: null,
  userId: null,
  userScope: null,
  currentGameId: null,
  currentGame: null,
  currentPlayerId: null,
  currentPlayer: null,

  setAuthToken: (token) => {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      const { userId, userScope } = parseToken(token);
      if (userId) {
        set({ authToken: token, userId, userScope });
        useOptionsStore.getState().initializeOptions(userId);
        restoreGameAndPlayer(userId);
      } else {
        set({ authToken: token, userId: null, userScope });
      }
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      set({ authToken: null, userId: null, userScope: null, currentGameId: null, currentGame: null, currentPlayerId: null, currentPlayer: null });
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

  setCurrentPlayer: (player) => {
    const userId = get().userId;
    console.log('setCurrentPlayer called:', { player, userId });
    if (userId && player) {
      const storageKey = `currentPlayer_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(player));
      console.log('Player saved to localStorage:', storageKey);
      set({ currentPlayerId: player.id, currentPlayer: player });
    } else if (userId && !player) {
      const storageKey = `currentPlayer_${userId}`;
      localStorage.removeItem(storageKey);
      console.log('Player removed from localStorage:', storageKey);
      set({ currentPlayerId: null, currentPlayer: null });
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
      enabled: import.meta.env.DEV, // Only enable in development
    }
  )
);

function parseToken(token: string): { userId: string | null; userScope: string | null } {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: payload.sub || payload.userId || null,
      userScope: payload.scope || null,
    };
  } catch {
    return { userId: null, userScope: null };
  }
}

function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp) {
      return Date.now() < payload.exp * 1000;
    }
    return true;
  } catch {
    return false;
  }
}

function restoreGameAndPlayer(userId: string): void {
  const storageKey = `currentGame_${userId}`;
  const storedGame = localStorage.getItem(storageKey);
  if (storedGame) {
    try {
      const game = JSON.parse(storedGame) as GameDto;
      useAuthStore.getState().setCurrentGame(game);
    } catch {
      localStorage.removeItem(storageKey);
    }
  }

  const playerStorageKey = `currentPlayer_${userId}`;
  const storedPlayer = localStorage.getItem(playerStorageKey);
  if (storedPlayer) {
    try {
      const player = JSON.parse(storedPlayer) as PlayerDto;
      useAuthStore.getState().setCurrentPlayer(player);
    } catch {
      localStorage.removeItem(playerStorageKey);
    }
  }
}

useAuthStore.setState({
  initializeAuth: function () {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (storedToken && isTokenValid(storedToken)) {
      const { userId, userScope } = parseToken(storedToken);
      if (userId) {
        useAuthStore.setState({
          authToken: storedToken,
          userId,
          userScope,
        });
        useOptionsStore.getState().initializeOptions(userId);
        restoreGameAndPlayer(userId);
      }
    } else if (storedToken) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  },
}); 