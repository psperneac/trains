import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
interface OptionsState {
  showLabels: boolean;
  setShowLabels: (show: boolean, userId?: string | null) => void;
  showVisible: boolean;
  setShowVisible: (show: boolean) => void;
  initializeOptions: (userId: string) => void;
}

export const useOptionsStore = create<OptionsState>()(
  devtools(
    (set) => ({
      showLabels: false,
      showVisible: false,

      setShowLabels: (show: boolean, userId?: string | null) => {
        set((state) => {
          const newState = { showLabels: show };
          if (userId) {
            localStorage.setItem(`placeSettings_${userId}`, JSON.stringify({ 
              ...JSON.parse(localStorage.getItem(`placeSettings_${userId}`) || '{}'),
              showLabels: show 
            }));
          }
          return newState;
        });
      },

      setShowVisible: (show: boolean) => {
        set({ showVisible: show });
      },

      initializeOptions: (userId: string) => {
        const stored = localStorage.getItem(`placeSettings_${userId}`);
        if (stored) {
          try {
            const settings = JSON.parse(stored);
            if (typeof settings.showLabels === 'boolean') {
              set({ showLabels: settings.showLabels });
            }
            if (typeof settings.showVisible === 'boolean') {
              set({ showVisible: settings.showVisible });
            }
          } catch (e) {
            console.error('Failed to parse place settings', e);
          }
        } else {
          set({ showLabels: false, showVisible: false });
        }
      },
    }),
    {
      name: 'options-store',
      enabled: import.meta.env.DEV,
    }
  )
);
