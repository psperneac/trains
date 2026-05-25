import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '../config/api';
import type { VehicleInstanceDto } from '../types/vehicleInstance';
import { useAuthStore } from './authStore';
import { useSocketStore } from './socket';

interface VehicleInstanceState {
  vehicleInstancesByPlayer: Record<string, VehicleInstanceDto[]>;
  loading: boolean;
  error: string | null;
  fetchVehicleInstancesByPlayerId: (playerId: string) => Promise<void>;
  updateVehicle: (vehicleId: string, vehicle: Partial<VehicleInstanceDto>) => void;
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

      updateVehicle: (vehicleId: string, vehicle: Partial<VehicleInstanceDto>) => {
        const { vehicleInstancesByPlayer } = get();
        const updated = { ...vehicleInstancesByPlayer };
        for (const playerId of Object.keys(updated)) {
          const instances = updated[playerId];
          const idx = instances.findIndex(v => v.id === vehicleId);
          if (idx !== -1) {
            const updatedInstances = [...instances];
            updatedInstances[idx] = {
              ...updatedInstances[idx],
              ...vehicle,
            };
            updated[playerId] = updatedInstances;
            break;
          }
        }
        set({ vehicleInstancesByPlayer: updated });
      },
    }),
    {
      name: 'vehicle-instance-store',
      enabled: import.meta.env.DEV,
    }
  )
);

/**
 * Initialize socket listeners for vehicle updates.
 * Call this when the game page mounts.
 */
export function initVehicleSocketListeners() {
  const handleVehicleStateUpdated = (data: { vehicle: VehicleInstanceDto }) => {
    useVehicleInstanceStore.getState().updateVehicle(data.vehicle.id, data.vehicle);
  };

  const handleFullSync = (data: { vehicleInstances?: VehicleInstanceDto[] }) => {
    if (!data.vehicleInstances) return;
    for (const vehicle of data.vehicleInstances) {
      useVehicleInstanceStore.getState().updateVehicle(vehicle.id, vehicle);
    }
  };

  const socketStore = useSocketStore.getState();
  socketStore.off('vehicleStateUpdated', handleVehicleStateUpdated);
  socketStore.off('fullSync', handleFullSync);
  socketStore.on('vehicleStateUpdated', handleVehicleStateUpdated);
  socketStore.on('fullSync', handleFullSync);
}
