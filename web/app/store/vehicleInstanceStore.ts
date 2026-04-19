import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '../config/api';
import type { VehicleInstanceDto } from '../types/vehicleInstance';
import { useAuthStore } from './authStore';

interface VehicleInstanceState {
  vehicleInstancesByPlayer: Record<string, VehicleInstanceDto[]>;
  loading: boolean;
  error: string | null;
  fetchVehicleInstancesByPlayerId: (playerId: string) => Promise<void>;
}

export const useVehicleInstanceStore = create<VehicleInstanceState>()(
  devtools(
    (set, get) => ({
      vehicleInstancesByPlayer: {},
      loading: false,
      error: null,

      fetchVehicleInstancesByPlayerId: async (playerId: string) => {
        set({ loading: true, error: null });
        try {
          const rawToken = useAuthStore.getState().authToken;
          const authToken = typeof rawToken === 'string' ? rawToken : undefined;
          const response = await apiRequest<{ data: VehicleInstanceDto[] }>(
            `/api/vehicle-instances/by-player/${playerId}?limit=1000`,
            { method: 'GET', authToken }
          );
          set({
            vehicleInstancesByPlayer: {
              ...get().vehicleInstancesByPlayer,
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
      name: 'vehicle-instance-store',
      enabled: import.meta.env.DEV,
    }
  )
);
