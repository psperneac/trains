import { create } from 'zustand';
import { apiRequest } from '../config/api';
import type { PlaceDto } from '../types/place';
import { useAuthStore } from './authStore';

interface PlaceState {
  places: PlaceDto[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  totalCount: number;
  fetchPlaces: () => Promise<void>;
  addPlace: (place: Omit<PlaceDto, 'id'>) => Promise<void>;
  updatePlace: (place: PlaceDto) => Promise<void>;
  deletePlace: (id: string) => Promise<void>;
}

export const usePlaceStore = create<PlaceState>((set, get) => ({
  places: [],
  loading: false,
  error: null,
  page: 1,
  limit: 0,
  totalCount: 0,
  fetchPlaces: async () => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const response = await apiRequest<{ data: PlaceDto[]; page: number; limit: number; totalCount: number }>('/api/places', { method: 'GET', authToken });
      set({
        places: response.data,
        page: response.page,
        limit: response.limit,
        totalCount: response.totalCount,
        loading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
  addPlace: async (place) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      await apiRequest<PlaceDto>('/api/places', {
        method: 'POST',
        authToken,
        body: JSON.stringify(place),
      });
      await get().fetchPlaces();
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
  updatePlace: async (place) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      await apiRequest<PlaceDto>(`/api/places/${place.id}`, {
        method: 'PUT',
        authToken,
        body: JSON.stringify(place),
      });
      await get().fetchPlaces();
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
  deletePlace: async (id) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      await apiRequest<void>(`/api/places/${id}`, {
        method: 'DELETE',
        authToken,
      });
      await get().fetchPlaces();
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
})); 