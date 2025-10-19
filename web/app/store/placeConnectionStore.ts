import { create } from 'zustand';
import { apiRequest } from '../config/api';
import { DEFAULT_PAGE_SIZE } from '../constants/pagination';
import type { PlaceConnectionDto } from '../types/placeConnection';
import { useAuthStore } from './authStore';

interface PlaceConnectionState {
  placeConnections: PlaceConnectionDto[];
  allPlaceConnections: PlaceConnectionDto[];
  
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  totalCount: number;
  
  fetchPlaceConnections: (page?: number, limit?: number) => Promise<void>;
  fetchPlaceConnectionsByGameId: (gameId: string, page?: number, limit?: number) => Promise<void>;
  fetchAllPlaceConnections: () => Promise<void>;
  addPlaceConnection: (placeConnection: Omit<PlaceConnectionDto, 'id'>) => Promise<void>;
  updatePlaceConnection: (placeConnection: PlaceConnectionDto) => Promise<void>;
  deletePlaceConnection: (id: string) => Promise<void>;
}

export const usePlaceConnectionStore = create<PlaceConnectionState>((set, get) => ({
  placeConnections: [],
  allPlaceConnections: [],
  
  loading: false,
  error: null,
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  totalCount: 0,

  fetchPlaceConnections: async (page = 1, limit = DEFAULT_PAGE_SIZE) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const response = await apiRequest<{ data: PlaceConnectionDto[]; page: number; limit: number; totalCount: number }>(
        `/api/place-connections?page=${page}&limit=${limit}`,
        { method: 'GET', authToken }
      );
      set({
        placeConnections: response.data,
        page: page,
        limit: response.limit,
        totalCount: response.totalCount,
        loading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
  
  fetchPlaceConnectionsByGameId: async (gameId: string, page = 1, limit = DEFAULT_PAGE_SIZE) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const response = await apiRequest<{ data: PlaceConnectionDto[]; page: number; limit: number; totalCount: number }>(
        `/api/place-connections/game/${gameId}?page=${page}&limit=${limit}`,
        { method: 'GET', authToken }
      );
      set({
        placeConnections: response.data,
        page: page,
        limit: response.limit,
        totalCount: response.totalCount,
        loading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
  
  fetchAllPlaceConnections: async () => {
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const response = await apiRequest<{ data: PlaceConnectionDto[] }>(
        '/api/place-connections?limit=1000',
        { method: 'GET', authToken }
      );
      set({ allPlaceConnections: response.data });
    } catch (err: any) {
      console.error('Error fetching all place connections:', err);
    }
  },
  
  addPlaceConnection: async (placeConnection) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      await apiRequest<PlaceConnectionDto>('/api/place-connections', {
        method: 'POST',
        authToken,
        body: JSON.stringify(placeConnection),
      });
      await Promise.all([
        get().fetchPlaceConnections(get().page, get().limit),
        get().fetchAllPlaceConnections()
      ]);
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
  
  updatePlaceConnection: async (placeConnection) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      await apiRequest<PlaceConnectionDto>(`/api/place-connections/${placeConnection.id}`, {
        method: 'PUT',
        authToken,
        body: JSON.stringify(placeConnection),
      });
      await Promise.all([
        get().fetchPlaceConnections(get().page, get().limit),
        get().fetchAllPlaceConnections()
      ]);
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
  
  deletePlaceConnection: async (id) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      await apiRequest<void>(`/api/place-connections/${id}`, {
        method: 'DELETE',
        authToken,
      });
      await Promise.all([
        get().fetchPlaceConnections(get().page, get().limit),
        get().fetchAllPlaceConnections()
      ]);
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
}));

