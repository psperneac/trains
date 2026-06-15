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
  inFlightRequestsByPlayer: Record<string, Promise<void> | undefined>;
  fetchVehicleInstancesByPlayerId: (playerId: string) => Promise<void>;
  loadVehicleInstancesByPlayerId: (playerId: string) => Promise<void>;
  updateVehicle: (vehicleId: string, vehicle: Partial<VehicleInstanceDto>) => void;
}

// Internal helper — kept outside the state interface
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchVehicleInstancesByPlayerIdImpl(set: any, get: () => VehicleInstanceState, playerId: string) {
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
  } finally {
    set((state: VehicleInstanceState) => ({
      ...state,
      inFlightRequestsByPlayer: {
        ...state.inFlightRequestsByPlayer,
        [playerId]: undefined
      }
    }));
  }
}

export const useVehicleInstanceStore = create<VehicleInstanceState>()(
  devtools(
    (set, get) => ({
      vehicleInstancesByPlayer: {},
      loading: false,
      error: null,
      inFlightRequestsByPlayer: {},

      fetchVehicleInstancesByPlayerId: async (playerId: string) => {
        const { inFlightRequestsByPlayer } = get();

        if (inFlightRequestsByPlayer[playerId]) {
          return inFlightRequestsByPlayer[playerId];
        }

        const networkPromise = fetchVehicleInstancesByPlayerIdImpl(set, get, playerId);
        inFlightRequestsByPlayer[playerId] = networkPromise;
        return networkPromise;
      },

      // The smart "load" method — only fetches if not already fetched
      loadVehicleInstancesByPlayerId: async (playerId: string) => {
        const { inFlightRequestsByPlayer, vehicleInstancesByPlayer } = get();

        if (inFlightRequestsByPlayer[playerId]) {
          return inFlightRequestsByPlayer[playerId];
        }

        if (vehicleInstancesByPlayer[playerId]) {
          console.log(`Cache hit for player ${playerId}, skipping fetch.`);
          return;
        }

        return get().fetchVehicleInstancesByPlayerId(playerId);
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
      store: 'trains-app',
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
