import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '../config/api';
import type { VehicleDto } from '../types/vehicle';
import { useAuthStore } from './authStore';

interface VehicleState {
  vehicles: VehicleDto[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  totalCount: number;
  fetchVehiclesByGameId: (gameId: string) => Promise<void>;
  addVehicle: (vehicle: Omit<VehicleDto, 'id'>, gameId: string) => Promise<void>;
  updateVehicle: (vehicle: VehicleDto, gameId: string) => Promise<void>;
  deleteVehicle: (id: string, gameId: string) => Promise<void>;
}

export const useVehicleStore = create<VehicleState>()(
  devtools(
    (set, get) => ({
      vehicles: [],
      loading: false,
      error: null,
      page: 1,
      limit: 0,
      totalCount: 0,

      fetchVehiclesByGameId: async (gameId: string) => {
        set({ loading: true, error: null });
        try {
          const rawToken = useAuthStore.getState().authToken;
          const authToken = typeof rawToken === 'string' ? rawToken : undefined;
          const response = await apiRequest<{ data: VehicleDto[]; page: number; limit: number; totalCount: number }>(
            `/api/vehicles/game/${gameId}?limit=10000`,
            { method: 'GET', authToken }
          );
          set({
            vehicles: response.data,
            page: response.page,
            limit: response.limit,
            totalCount: response.totalCount,
            loading: false
          });
        } catch (err: any) {
          set({ error: err.message || 'Unknown error', loading: false });
        }
      },

      addVehicle: async (vehicle, gameId) => {
        set({ loading: true, error: null });
        try {
          const rawToken = useAuthStore.getState().authToken;
          const authToken = typeof rawToken === 'string' ? rawToken : undefined;
          await apiRequest<VehicleDto>('/api/vehicles', {
            method: 'POST',
            authToken,
            body: JSON.stringify(vehicle),
          });
          await get().fetchVehiclesByGameId(gameId);
        } catch (err: any) {
          set({ error: err.message || 'Unknown error', loading: false });
        }
      },

      updateVehicle: async (vehicle, gameId) => {
        set({ loading: true, error: null });
        try {
          const rawToken = useAuthStore.getState().authToken;
          const authToken = typeof rawToken === 'string' ? rawToken : undefined;
          await apiRequest<VehicleDto>(`/api/vehicles/${vehicle.id}`, {
            method: 'PUT',
            authToken,
            body: JSON.stringify(vehicle),
          });
          await get().fetchVehiclesByGameId(gameId);
        } catch (err: any) {
          set({ error: err.message || 'Unknown error', loading: false });
        }
      },

      deleteVehicle: async (id, gameId) => {
        set({ loading: true, error: null });
        try {
          const rawToken = useAuthStore.getState().authToken;
          const authToken = typeof rawToken === 'string' ? rawToken : undefined;
          await apiRequest<void>(`/api/vehicles/${id}`, {
            method: 'DELETE',
            authToken,
          });
          await get().fetchVehiclesByGameId(gameId);
        } catch (err: any) {
          set({ error: err.message || 'Unknown error', loading: false });
        }
      },
    }),
    {
      name: 'vehicle-store',
      enabled: import.meta.env.DEV,
    }
  )
);