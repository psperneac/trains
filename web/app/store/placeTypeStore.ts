import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '../config/api';
import type { PlaceTypeDto } from '../types/placeType';
import { useAuthStore } from './authStore';

interface PlaceTypeState {
  placeTypes: PlaceTypeDto[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  totalCount: number;
  fetchPlaceTypes: () => Promise<void>;
}

export const usePlaceTypeStore = create<PlaceTypeState>()(
  devtools(
    (set) => ({
  placeTypes: [],
  loading: false,
  error: null,
  page: 1,
  limit: 0,
  totalCount: 0,
  fetchPlaceTypes: async () => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const response = await apiRequest<{ data: PlaceTypeDto[]; page: number; limit: number; totalCount: number }>('/api/place-types', { method: 'GET', authToken });
      set({ 
        placeTypes: response.data, 
        page: response.page, 
        limit: response.limit, 
        totalCount: response.totalCount, 
        loading: false 
      });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
    }),
    {
      name: 'place-types-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
); 