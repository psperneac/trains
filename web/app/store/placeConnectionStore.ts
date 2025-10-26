import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '../config/api';
import type { PlaceConnectionDto } from '../types/placeConnection';
import { useAuthStore } from './authStore';

interface PlaceConnectionState {
  allPlaceConnections: PlaceConnectionDto[];
  
  loading: boolean;
  error: string | null;
  
  fetchPlaceConnections: () => Promise<void>;
  fetchPlaceConnectionsByGameId: (gameId: string) => Promise<void>;
  addPlaceConnection: (placeConnection: Omit<PlaceConnectionDto, 'id'>) => Promise<void>;
  updatePlaceConnection: (placeConnection: PlaceConnectionDto) => Promise<void>;
  deletePlaceConnection: (id: string) => Promise<void>;
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
      await get().fetchPlaceConnections();
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
      await get().fetchPlaceConnections();
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
      await get().fetchPlaceConnections();
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
    }),
    {
      name: 'place-connections-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

