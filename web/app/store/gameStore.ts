import { create } from 'zustand';
import { apiRequest } from '../config/api';
import { DEFAULT_PAGE_SIZE } from '../constants/pagination';
import type { GameDto } from '../types/game';
import { useAuthStore } from './authStore';

interface GameState {
  games: GameDto[];
  allGames: GameDto[];

  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  totalCount: number;

  fetchGames: (page?: number, limit?: number) => Promise<void>;
  fetchAllGames: () => Promise<void>;
  addGame: (game: Omit<GameDto, 'id'>) => Promise<void>;
  updateGame: (game: GameDto) => Promise<void>;
  deleteGame: (id: string) => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  games: [],
  allGames: [],

  loading: false,
  error: null,
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  totalCount: 0,

  fetchGames: async (page = 1, limit = DEFAULT_PAGE_SIZE) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const response = await apiRequest<{ data: GameDto[]; page: number; limit: number; totalCount: number }>(
        `/api/games?page=${page}&limit=${limit}`,
        { method: 'GET', authToken }
      );
      set({
        games: response.data,
        page: page,
        limit: response.limit,
        totalCount: response.totalCount,
        loading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
  
  fetchAllGames: async () => {
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const response = await apiRequest<{ data: GameDto[] }>(
        '/api/games?limit=1000',
        { method: 'GET', authToken }
      );
      set({ allGames: response.data });
    } catch (err: any) {
      console.error('Error fetching all games:', err);
      set({ error: err.message || 'Unknown error' });
    }
  },

  addGame: async (game) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      await apiRequest<GameDto>('/api/games', {
        method: 'POST',
        authToken,
        body: JSON.stringify(game),
      });
      await Promise.all([
        get().fetchGames(get().page, get().limit),
        get().fetchAllGames()
      ]);
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },

  updateGame: async (game) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      await apiRequest<GameDto>(`/api/games/${game.id}`, {
        method: 'PUT',
        authToken,
        body: JSON.stringify(game),
      });
      await Promise.all([
        get().fetchGames(get().page, get().limit),
        get().fetchAllGames()
      ]);
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },

  deleteGame: async (id) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      await apiRequest<void>(`/api/games/${id}`, {
        method: 'DELETE',
        authToken,
      });
      await Promise.all([
        get().fetchGames(get().page, get().limit),
        get().fetchAllGames()
      ]);
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
}));
