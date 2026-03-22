import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '../config/api';
import type { PlaceDto } from '../types/place';
import { useAuthStore } from './authStore';

interface PlaceState {
  allPlaces: PlaceDto[];
  
  loading: boolean;
  error: string | null;
  
  fetchPlaces: () => Promise<void>;
  fetchPlacesByGameId: (gameId: string) => Promise<void>;
  fetchAllPlaces: () => Promise<void>;
  addPlace: (place: Omit<PlaceDto, 'id'>, gameId: string) => Promise<void>;
  updatePlace: (place: PlaceDto, gameId: string) => Promise<void>;
  deletePlace: (id: string, gameId: string) => Promise<void>;
}

export const usePlaceStore = create<PlaceState>()(
  devtools(
    (set, get) => ({
  allPlaces: [],
  
  loading: false,
  error: null,

  fetchPlaces: async () => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const response = await apiRequest<{ data: PlaceDto[] }>(
        '/api/places?limit=10000',
        { method: 'GET', authToken }
      );
      set({
        allPlaces: response.data,
        loading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },

  fetchPlacesByGameId: async (gameId: string) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const response = await apiRequest<{ data: PlaceDto[] }>(
        `/api/places/game/${gameId}?limit=10000`,
        { method: 'GET', authToken }
      );
      set({
        allPlaces: response.data,
        loading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
  
  fetchAllPlaces: async () => {
    // Just delegate to fetchPlaces since we're loading all places now
    await get().fetchPlaces();
  },
  
  addPlace: async (place, gameId) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      await apiRequest<PlaceDto>('/api/places', {
        method: 'POST',
        authToken,
        body: JSON.stringify(place),
      });
      await get().fetchPlacesByGameId(gameId);
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
  
  updatePlace: async (place, gameId) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      await apiRequest<PlaceDto>(`/api/places/${place.id}`, {
        method: 'PUT',
        authToken,
        body: JSON.stringify(place),
      });
      await get().fetchPlacesByGameId(gameId);
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
  
  deletePlace: async (id, gameId) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      await apiRequest<void>(`/api/places/${id}`, {
        method: 'DELETE',
        authToken,
      });
      await get().fetchPlacesByGameId(gameId);
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },

    }),
    {
      name: 'places-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);