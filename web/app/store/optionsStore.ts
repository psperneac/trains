import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
interface OptionsState {
  showLabels: boolean;
  setShowLabels: (show: boolean, userId?: string | null) => void;
  initializeOptions: (userId: string) => void;
}

export const useOptionsStore = create<OptionsState>()(
  devtools(
    (set) => ({
      showLabels: false,

      setShowLabels: (show: boolean, userId?: string | null) => {
        if (userId) {
          localStorage.setItem(`placeSettings_${userId}`, JSON.stringify({ showLabels: show }));
        }
        set({ showLabels: show });
      },

      initializeOptions: (userId: string) => {
        const stored = localStorage.getItem(`placeSettings_${userId}`);
        if (stored) {
          try {
            const settings = JSON.parse(stored);
            if (typeof settings.showLabels === 'boolean') {
              set({ showLabels: settings.showLabels });
            }
          } catch (e) {
            console.error('Failed to parse place settings', e);
          }
        } else {
          // Default for new users or if no settings found
          set({ showLabels: false });
        }
      },
    }),
    {
      name: 'options-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
