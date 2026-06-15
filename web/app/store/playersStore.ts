import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '../config/api';
import { DEFAULT_PAGE_SIZE } from '../constants/pagination';
import type { PlayerDto, SendGoldAndGemsDto, TransactionDto, PlayerFullStateDto } from '../types/player';
import type { PlaceDto } from '../types/place';
import type { PlaceInstanceDto } from '../types/placeInstance';
import { useAuthStore } from './authStore';

export interface MapViewData {
  owned: PlaceInstanceDto[];
  available: (PlaceDto & { priceGold: number; priceGems: number })[];
  connections: any[];
}

interface PlayersState {
  players: PlayerDto[];
  allPlayers: PlayerDto[];
  transactions: TransactionDto[];
  mapViewData: MapViewData | null;

  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  totalCount: number;
  inFlightRequestsByPlayer: Record<string, Promise<MapViewData> | undefined>;

  fetchPlayers: (page?: number, limit?: number) => Promise<void>;
  fetchAllPlayers: () => Promise<void>;
  fetchPlayersByUserId: (userId: string, page?: number, limit?: number) => Promise<void>;
  fetchPlayersByGameId: (gameId: string, page?: number, limit?: number) => Promise<void>;
  fetchTransactions: (page?: number, limit?: number) => Promise<void>;
  sendGoldAndGems: (sendDto: SendGoldAndGemsDto) => Promise<PlayerDto>;
  addPlayer: (player: Omit<PlayerDto, 'id'>) => Promise<PlayerDto>;
  updatePlayer: (player: PlayerDto) => Promise<void>;
  deletePlayer: (id: string) => Promise<void>;
  fetchFullState: (playerId: string) => Promise<PlayerFullStateDto>;
  // Always hits the network. Coalesces in-flight requests for the same
  // player so two simultaneous calls share a single round-trip.
  fetchMapView: (playerId: string) => Promise<MapViewData>;
  // Returns the cached `mapViewData` if present, otherwise delegates to
  // `fetchMapView`. Use this on initial mount; use `fetchMapView` after a
  // mutation that needs the map to re-render.
  loadMapView: (playerId: string) => Promise<MapViewData>;
}

// Internal helper — kept outside the state interface
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchMapViewImpl(set: any, get: () => PlayersState, playerId: string): Promise<MapViewData> {
  try {
    const rawToken = useAuthStore.getState().authToken;
    const authToken = typeof rawToken === 'string' ? rawToken : undefined;
    const response = await apiRequest<MapViewData>(
      `/api/players/${playerId}/map-view`,
      { method: 'GET', authToken }
    );
    set({ mapViewData: response });
    return response;
  } catch (err: any) {
    set({ error: err.message || 'Unknown error' });
    throw err;
  } finally {
    set((state: PlayersState) => ({
      ...state,
      inFlightRequestsByPlayer: {
        ...state.inFlightRequestsByPlayer,
        [playerId]: undefined
      }
    }));
  }
}

export const usePlayersStore = create<PlayersState>()(
  devtools(
    (set, get) => ({
  players: [],
  allPlayers: [],
  transactions: [],
  mapViewData: null,

  loading: false,
  error: null,
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  totalCount: 0,
  inFlightRequestsByPlayer: {},

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

  addPlayer: async (player: Omit<PlayerDto, 'id'>): Promise<PlayerDto> => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const created = await apiRequest<PlayerDto>('/api/players', {
        method: 'POST',
        authToken,
        body: JSON.stringify(player),
      });
      await Promise.all([
        get().fetchPlayers(get().page, get().limit),
        get().fetchAllPlayers()
      ]);
      set({ loading: false });
      return created;
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
      throw err;
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

  fetchFullState: async (playerId: string): Promise<PlayerFullStateDto> => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const response = await apiRequest<PlayerFullStateDto>(
        `/api/players/${playerId}/full-state`,
        { method: 'GET', authToken }
      );
      set({ loading: false });
      return response;
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
      throw err;
    }
  },

  // `fetch*` always hits the network (coalesced on in-flight requests).
  // Use after a mutation so the map re-renders.
  fetchMapView: async (playerId: string): Promise<MapViewData> => {
    const { inFlightRequestsByPlayer } = get();

    if (inFlightRequestsByPlayer[playerId]) {
      return inFlightRequestsByPlayer[playerId]!;
    }

    const networkPromise = fetchMapViewImpl(set, get, playerId);
    inFlightRequestsByPlayer[playerId] = networkPromise;
    return networkPromise;
  },

  // `load*` returns the cached value if present. Use on initial mount.
  loadMapView: async (playerId: string): Promise<MapViewData> => {
    const { inFlightRequestsByPlayer, mapViewData } = get();

    if (inFlightRequestsByPlayer[playerId]) {
      return inFlightRequestsByPlayer[playerId]!;
    }

    if (mapViewData) {
      console.log(`Cache hit for player ${playerId}, skipping fetch.`);
      return mapViewData;
    }

    return get().fetchMapView(playerId);
  },
    }),
    {
      name: 'players-store', // Name for Redux DevTools
      store: 'trains-app',
      enabled: import.meta.env.DEV, // Only enable in development
    }
  )
);
