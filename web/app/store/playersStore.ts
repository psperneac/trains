import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '../config/api';
import { DEFAULT_PAGE_SIZE } from '../constants/pagination';
import type { PlayerDto, SendGoldAndGemsDto, TransactionDto } from '../types/player';
import { useAuthStore } from './authStore';

interface PlayersState {
  players: PlayerDto[];
  allPlayers: PlayerDto[];
  transactions: TransactionDto[];

  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  totalCount: number;

  fetchPlayers: (page?: number, limit?: number) => Promise<void>;
  fetchAllPlayers: () => Promise<void>;
  fetchPlayersByUserId: (userId: string, page?: number, limit?: number) => Promise<void>;
  fetchPlayersByGameId: (gameId: string, page?: number, limit?: number) => Promise<void>;
  fetchTransactions: (page?: number, limit?: number) => Promise<void>;
  sendGoldAndGems: (sendDto: SendGoldAndGemsDto) => Promise<PlayerDto>;
  addPlayer: (player: Omit<PlayerDto, 'id'>) => Promise<void>;
  updatePlayer: (player: PlayerDto) => Promise<void>;
  deletePlayer: (id: string) => Promise<void>;
}

export const usePlayersStore = create<PlayersState>()(
  devtools(
    (set, get) => ({
  players: [],
  allPlayers: [],
  transactions: [],

  loading: false,
  error: null,
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  totalCount: 0,

  fetchPlayers: async (page = 1, limit = DEFAULT_PAGE_SIZE) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const response = await apiRequest<{ data: PlayerDto[]; page: number; limit: number; totalCount: number }>(
        `/api/players?page=${page}&limit=${limit}`,
        { method: 'GET', authToken }
      );
      set({
        players: response.data,
        page: page,
        limit: response.limit,
        totalCount: response.totalCount,
        loading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
  
  fetchAllPlayers: async () => {
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const response = await apiRequest<{ data: PlayerDto[] }>(
        '/api/players?limit=1000',
        { method: 'GET', authToken }
      );
      set({ allPlayers: response.data });
    } catch (err: any) {
      console.error('Error fetching all players:', err);
      set({ error: err.message || 'Unknown error' });
    }
  },

  fetchPlayersByUserId: async (userId: string, page = 1, limit = DEFAULT_PAGE_SIZE) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const response = await apiRequest<{ data: PlayerDto[]; page: number; limit: number; totalCount: number }>(
        `/api/players/by-user/${userId}?page=${page}&limit=${limit}`,
        { method: 'GET', authToken }
      );
      set({
        players: response.data,
        page: page,
        limit: response.limit,
        totalCount: response.totalCount,
        loading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },

  fetchPlayersByGameId: async (gameId: string, page = 1, limit = DEFAULT_PAGE_SIZE) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const response = await apiRequest<{ data: PlayerDto[]; page: number; limit: number; totalCount: number }>(
        `/api/players/by-game/${gameId}?page=${page}&limit=${limit}`,
        { method: 'GET', authToken }
      );
      set({
        players: response.data,
        page: page,
        limit: response.limit,
        totalCount: response.totalCount,
        loading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },

  sendGoldAndGems: async (sendDto: SendGoldAndGemsDto): Promise<PlayerDto> => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const response = await apiRequest<PlayerDto>(
        '/api/players/send',
        {
          method: 'POST',
          authToken,
          body: JSON.stringify(sendDto),
        }
      );
      set({ loading: false });
      return response;
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
      throw err;
    }
  },

  fetchTransactions: async (page = 1, limit = DEFAULT_PAGE_SIZE) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const response = await apiRequest<{ data: TransactionDto[]; page: number; limit: number; totalCount: number }>(
        `/api/transactions?page=${page}&limit=${limit}`,
        { method: 'GET', authToken }
      );
      set({
        transactions: response.data,
        page: page,
        limit: response.limit,
        totalCount: response.totalCount,
        loading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },

  addPlayer: async (player: Omit<PlayerDto, 'id'>) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      await apiRequest<PlayerDto>('/api/players', {
        method: 'POST',
        authToken,
        body: JSON.stringify(player),
      });
      await Promise.all([
        get().fetchPlayers(get().page, get().limit),
        get().fetchAllPlayers()
      ]);
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },

  updatePlayer: async (player: PlayerDto) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      await apiRequest<PlayerDto>(`/api/players/${player.id}`, {
        method: 'PUT',
        authToken,
        body: JSON.stringify(player),
      });
      await Promise.all([
        get().fetchPlayers(get().page, get().limit),
        get().fetchAllPlayers()
      ]);
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },

  deletePlayer: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      await apiRequest<void>(`/api/players/${id}`, {
        method: 'DELETE',
        authToken,
      });
      await Promise.all([
        get().fetchPlayers(get().page, get().limit),
        get().fetchAllPlayers()
      ]);
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
    }),
    {
      name: 'players-store', // Name for Redux DevTools
      enabled: process.env.NODE_ENV === 'development', // Only enable in development
    }
  )
);
