import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '../config/api';
import type { PlaceConnectionDto } from '../types/placeConnection';
import { useAuthStore } from './authStore';

interface CopyResult {
  copiedCount: number;
  skippedCount: number;
  overwrittenCount: number;
}

interface PlaceConnectionState {
  allPlaceConnections: PlaceConnectionDto[];
  
  loading: boolean;
  error: string | null;
  
  fetchPlaceConnections: () => Promise<void>;
  fetchPlaceConnectionsByGameId: (gameId: string) => Promise<void>;
  addPlaceConnection: (placeConnection: Omit<PlaceConnectionDto, 'id'>, gameId: string) => Promise<void>;
  updatePlaceConnection: (placeConnection: PlaceConnectionDto, gameId: string) => Promise<void>;
  deletePlaceConnection: (id: string, gameId: string) => Promise<void>;
  deleteAllPlaceConnections: (gameId: string) => Promise<number>;
  copyPlaceConnections: (sourceGameId: string, targetGameId: string, overwrite?: boolean) => Promise<CopyResult>;
}

export const usePlaceConnectionStore = create<PlaceConnectionState>()(
  devtools(
    (set, get) => ({
  allPlaceConnections: [],
  
  loading: false,
  error: null,

  fetchPlaceConnections: async () => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const response = await apiRequest<{ data: PlaceConnectionDto[] }>(
        '/api/place-connections?limit=10000',
        { method: 'GET', authToken }
      );
      set({
        allPlaceConnections: response.data,
        loading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
  
  fetchPlaceConnectionsByGameId: async (gameId: string) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const response = await apiRequest<{ data: PlaceConnectionDto[] }>(
        `/api/place-connections/game/${gameId}?limit=10000`,
        { method: 'GET', authToken }
      );
      set({
        allPlaceConnections: response.data,
        loading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
  
  addPlaceConnection: async (placeConnection, gameId) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      await apiRequest<PlaceConnectionDto>('/api/place-connections', {
        method: 'POST',
        authToken,
        body: JSON.stringify(placeConnection),
      });
      await get().fetchPlaceConnectionsByGameId(gameId);
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
  
  updatePlaceConnection: async (placeConnection, gameId) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      await apiRequest<PlaceConnectionDto>(`/api/place-connections/${placeConnection.id}`, {
        method: 'PUT',
        authToken,
        body: JSON.stringify(placeConnection),
      });
      await get().fetchPlaceConnectionsByGameId(gameId);
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
  
  deletePlaceConnection: async (id, gameId) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      await apiRequest<void>(`/api/place-connections/${id}`, {
        method: 'DELETE',
        authToken,
      });
      await get().fetchPlaceConnectionsByGameId(gameId);
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },

  deleteAllPlaceConnections: async (gameId) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const result = await apiRequest<number>(`/api/place-connections/game/${gameId}`, {
        method: 'DELETE',
        authToken,
      });
      await get().fetchPlaceConnectionsByGameId(gameId);
      set({ loading: false });
      return result;
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
      throw err;
    }
  },

  copyPlaceConnections: async (sourceGameId, targetGameId, overwrite = false) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const result = await apiRequest<CopyResult>('/api/place-connections/copy', {
        method: 'POST',
        authToken,
        body: JSON.stringify({ sourceGameId, targetGameId, overwrite }),
      });
      await get().fetchPlaceConnectionsByGameId(targetGameId);
      set({ loading: false });
      return result;
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
      throw err;
    }
  },
    }),
    {
      name: 'place-connections-store',
      enabled: import.meta.env.DEV,
    }
  )
);

