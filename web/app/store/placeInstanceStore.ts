import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '../config/api';
import type { PlaceInstanceDto } from '../types/placeInstance';
import { useAuthStore } from './authStore';

interface PlaceInstanceState {
  placeInstancesByPlayer: Record<string, PlaceInstanceDto[]>;
  loading: boolean;
  error: string | null;
  fetchPlaceInstancesByPlayerId: (playerId: string) => Promise<void>;
}

export const usePlaceInstanceStore = create<PlaceInstanceState>()(
  devtools(
    (set, get) => ({
      placeInstancesByPlayer: {},
      loading: false,
      error: null,

      fetchPlaceInstancesByPlayerId: async (playerId: string) => {
        set({ loading: true, error: null });
        try {
          const rawToken = useAuthStore.getState().authToken;
          const authToken = typeof rawToken === 'string' ? rawToken : undefined;
          const response = await apiRequest<{ data: PlaceInstanceDto[] }>(
            `/api/place-instances/by-player/${playerId}?limit=1000`,
            { method: 'GET', authToken }
          );
          set({
            placeInstancesByPlayer: {
              ...get().placeInstancesByPlayer,
              [playerId]: response.data
            },
            loading: false
          });
        } catch (err: any) {
          set({ error: err.message || 'Unknown error', loading: false });
        }
      },
    }),
    {
      name: 'place-instance-store',
      enabled: import.meta.env.DEV,
    }
  )
);