import { create } from 'zustand';
import { apiRequest } from '../config/api';
import { DEFAULT_PAGE_SIZE } from '../constants/pagination';
import type { PlaceDto } from '../types/place';
import { useAuthStore } from './authStore';

interface PlaceState {
  places: PlaceDto[];
  allPlaces: PlaceDto[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  totalCount: number;
  fetchPlaces: (page?: number, limit?: number) => Promise<void>;
  fetchAllPlaces: () => Promise<void>;
  addPlace: (place: Omit<PlaceDto, 'id'>) => Promise<void>;
  updatePlace: (place: PlaceDto) => Promise<void>;
  deletePlace: (id: string) => Promise<void>;
}

export const usePlaceStore = create<PlaceState>((set, get) => ({
  places: [],
  allPlaces: [],
  loading: false,
  error: null,
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  totalCount: 0,
  fetchPlaces: async (page = 1, limit = DEFAULT_PAGE_SIZE) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const response = await apiRequest<{ data: PlaceDto[]; page: number; limit: number; totalCount: number }>(
        `/api/places?page=${page}&limit=${limit}`,
        { method: 'GET', authToken }
      );
      set({
        places: response.data,
        page: page,
        limit: response.limit,
        totalCount: response.totalCount,
        loading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
  fetchAllPlaces: async () => {
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const response = await apiRequest<{ data: PlaceDto[] }>(
        '/api/places?limit=1000',
        { method: 'GET', authToken }
      );
      set({ allPlaces: response.data });
    } catch (err: any) {
      console.error('Error fetching all places:', err);
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
      await Promise.all([
        get().fetchPlaces(get().page, get().limit),
        get().fetchAllPlaces()
      ]);
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
      await Promise.all([
        get().fetchPlaces(get().page, get().limit),
        get().fetchAllPlaces()
      ]);
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
      await Promise.all([
        get().fetchPlaces(get().page, get().limit),
        get().fetchAllPlaces()
      ]);
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
})); 