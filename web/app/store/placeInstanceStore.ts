import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '../config/api';
import type { PlaceInstanceDto } from '../types/placeInstance';
import type { JobOffer } from '../types/job';
import { useAuthStore } from './authStore';
import { useSocketStore } from './socket';

export interface PlaceInstanceState {
  placeInstancesByPlayer: Record<string, PlaceInstanceDto[]>;
  loading: boolean;
  error: string | null;
  inFlightRequestsByPlayer: Record<string, Promise<void> | undefined>;
  fetchPlaceInstancesByPlayerId: (playerId: string) => Promise<void>;
  loadPlaceInstancesByPlayerId: (playerId: string) => Promise<void>;
  setJobOffers: (placeInstanceId: string, jobOffers: JobOffer[]) => void;
  setPlaceInstance: (placeInstance: PlaceInstanceDto) => void;
  purchasePlace: (playerId: string, placeId: string, description?: string) => Promise<{ success: boolean; error?: string; placeInstance?: PlaceInstanceDto }>;
}

// Internal helper — kept outside the state interface to avoid TypeScript complaints
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchPlaceInstancesByPlayerIdImpl(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set: any,
  get: () => PlaceInstanceState,
  playerId: string
) {
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
  } finally {
    // clean in flight flag
    set((state: PlaceInstanceState) => ({
      ...state,
      inFlightRequestsByPlayer: {
        ...state.inFlightRequestsByPlayer,
        [playerId]: undefined
      }
    }));
  }
}

export const usePlaceInstanceStore = create<PlaceInstanceState>()(
  devtools(
    (set, get) => ({
      placeInstancesByPlayer: {},
      loading: false,
      error: null,
      inFlightRequestsByPlayer: {},

      fetchPlaceInstancesByPlayerId: async (playerId: string) => {
        const { inFlightRequestsByPlayer } = get();

        if (inFlightRequestsByPlayer[playerId]) {
          return inFlightRequestsByPlayer[playerId];
        }

        const networkPromise = fetchPlaceInstancesByPlayerIdImpl(set, get, playerId);
        inFlightRequestsByPlayer[playerId] = networkPromise;
        return networkPromise;
      },

      // The smart "load" method
      // only fetches if not already fetched
      loadPlaceInstancesByPlayerId: async (playerId: string) => {
        const { inFlightRequestsByPlayer, placeInstancesByPlayer } = get();

        if (inFlightRequestsByPlayer[playerId]) {
          return inFlightRequestsByPlayer[playerId];
        }

        // 1. Cache Check: Do we already have data for this player?
        if (placeInstancesByPlayer[playerId]) {
          console.log(`Cache hit for player ${playerId}, skipping fetch.`);
          return; // Resolves the promise immediately
        }

        return get().fetchPlaceInstancesByPlayerId(playerId);
      },

      setJobOffers: (placeInstanceId: string, jobOffers: JobOffer[]) => {
        const { placeInstancesByPlayer } = get();
        // Update jobOffers for the place instance with matching placeInstanceId
        const updated = { ...placeInstancesByPlayer };
        for (const playerId of Object.keys(updated)) {
          const instances = updated[playerId];
          const idx = instances.findIndex(pi => pi.id === placeInstanceId);
          if (idx !== -1) {
            const updatedInstances = [...instances];
            updatedInstances[idx] = {
              ...updatedInstances[idx],
              jobOffers,
            };
            updated[playerId] = updatedInstances;
            break;
          }
        }
        set({ placeInstancesByPlayer: updated });
      },

      setPlaceInstance: (placeInstance: PlaceInstanceDto) => {
        const { placeInstancesByPlayer } = get();
        const playerId = placeInstance.playerId;
        if (!playerId) return;
        const updated = { ...placeInstancesByPlayer };
        const instances = updated[playerId] || [];
        const idx = instances.findIndex(pi => pi.id === placeInstance.id);
        if (idx !== -1) {
          const updatedInstances = [...instances];
          updatedInstances[idx] = placeInstance;
          updated[playerId] = updatedInstances;
        } else {
          updated[playerId] = [...instances, placeInstance];
        }
        set({ placeInstancesByPlayer: updated });
      },

      purchasePlace: async (playerId: string, placeId: string, description?: string) => {
        const rawToken = useAuthStore.getState().authToken;
        const authToken = typeof rawToken === 'string' ? rawToken : undefined;
        const result = await apiRequest<{ success: boolean; error?: string; placeInstance?: PlaceInstanceDto }>(
          `/api/players/${playerId}/purchase-place`,
          {
            method: 'POST',
            authToken,
            body: JSON.stringify({ placeId, description }),
          }
        );
        if (result.success && result.placeInstance) {
          get().setPlaceInstance(result.placeInstance);
        }
        return result;
      },
    }),
    {
      name: 'place-instance-store',
      store: 'trains-app',
      enabled: import.meta.env.DEV,
    }
  )
);

/**
 * Initialize socket listeners for job offers updates.
 * Call this when the game page mounts.
 */
export function initPlaceInstanceSocketListeners() {
  const handleJobOffersUpdated = (data: { placeId: string; jobOffers: JobOffer[] }) => {
    console.log('handleJobOffersUpdated', data.placeId, data.jobOffers);
    usePlaceInstanceStore.getState().setJobOffers(data.placeId, data.jobOffers);
  };

  const handleFullSync = (data: { placeInstances?: PlaceInstanceDto[] }) => {
    if (!data.placeInstances) return;
    for (const pi of data.placeInstances) {
      usePlaceInstanceStore.getState().setPlaceInstance(pi);
    }
  };

  const socketStore = useSocketStore.getState();
  socketStore.off('jobOffersUpdated', handleJobOffersUpdated);
  socketStore.off('fullSync', handleFullSync);
  socketStore.on('jobOffersUpdated', handleJobOffersUpdated);
  socketStore.on('fullSync', handleFullSync);
}
