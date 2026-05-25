import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '../config/api';
import type { PlaceInstanceDto } from '../types/placeInstance';
import type { JobOffer } from '../types/job';
import { useAuthStore } from './authStore';
import { useSocketStore } from './socket';

interface PlaceInstanceState {
  placeInstancesByPlayer: Record<string, PlaceInstanceDto[]>;
  loading: boolean;
  error: string | null;
  fetchPlaceInstancesByPlayerId: (playerId: string) => Promise<void>;
  setJobOffers: (placeInstanceId: string, jobOffers: JobOffer[]) => void;
  setPlaceInstance: (placeInstance: PlaceInstanceDto) => void;
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
    }),
    {
      name: 'place-instance-store',
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