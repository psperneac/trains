import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '../config/api';
import type { VehicleTypeDto } from '../types/vehicleType';
import { useAuthStore } from './authStore';

interface VehicleTypeState {
  vehicleTypes: VehicleTypeDto[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  totalCount: number;
  fetchVehicleTypes: () => Promise<void>;
}

export const useVehicleTypeStore = create<VehicleTypeState>()(
  devtools(
    (set) => ({
  vehicleTypes: [],
  loading: false,
  error: null,
  page: 1,
  limit: 0,
  totalCount: 0,
  fetchVehicleTypes: async () => {
    set({ loading: true, error: null });
    try {
      const rawToken = useAuthStore.getState().authToken;
      const authToken = typeof rawToken === 'string' ? rawToken : undefined;
      const response = await apiRequest<{ data: VehicleTypeDto[]; page: number; limit: number; totalCount: number }>('/api/vehicle-types', { method: 'GET', authToken });
      set({
        vehicleTypes: response.data,
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
      name: 'vehicle-types-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
); 