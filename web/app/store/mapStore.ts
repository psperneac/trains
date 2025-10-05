import { create } from 'zustand';
import { apiRequest } from '../config/api';
import { DEFAULT_PAGE_SIZE } from '../constants/pagination';
import type { MapDto } from '../types/map';
import { useAuthStore } from './authStore';

interface MapState {
  maps: MapDto[];
  allMaps: MapDto[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  totalCount: number;
  fetchMaps: (page?: number, limit?: number) => Promise<void>;
  fetchAllMaps: () => Promise<void>;
  addMap: (map: Omit<MapDto, 'id'>) => Promise<void>;
  updateMap: (map: MapDto) => Promise<void>;
  deleteMap: (id: string) => Promise<void>;
}

export const useMapStore = create<MapState>((set, get) => ({
  maps: [],
  allMaps: [],
  loading: false,
  error: null,
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  totalCount: 0,
  fetchMaps: async (page = 1, limit = DEFAULT_PAGE_SIZE) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const response = await apiRequest<{ data: MapDto[]; page: number; limit: number; totalCount: number }>(
        `/api/maps?page=${page}&limit=${limit}`,
        { method: 'GET', authToken }
      );
      set({
        maps: response.data,
        page: page,
        limit: response.limit,
        totalCount: response.totalCount,
        loading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
  fetchAllMaps: async () => {
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const response = await apiRequest<{ data: MapDto[] }>(
        '/api/maps?limit=1000',
        { method: 'GET', authToken }
      );
      set({ allMaps: response.data });
    } catch (err: any) {
      console.error('Error fetching all maps:', err);
    }
  },
  addMap: async (map) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      await apiRequest<MapDto>('/api/maps', {
        method: 'POST',
        authToken,
        body: JSON.stringify(map),
      });
      await Promise.all([
        get().fetchMaps(get().page, get().limit),
        get().fetchAllMaps()
      ]);
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
  updateMap: async (map) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      await apiRequest<MapDto>(`/api/maps/${map.id}`, {
        method: 'PUT',
        authToken,
        body: JSON.stringify(map),
      });
      await Promise.all([
        get().fetchMaps(get().page, get().limit),
        get().fetchAllMaps()
      ]);
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
  deleteMap: async (id) => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      await apiRequest<void>(`/api/maps/${id}`, {
        method: 'DELETE',
        authToken,
      });
      await Promise.all([
        get().fetchMaps(get().page, get().limit),
        get().fetchAllMaps()
      ]);
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
})); 