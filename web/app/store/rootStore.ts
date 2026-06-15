import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { usePlaceInstanceStore } from './placeInstanceStore';

// Re-export so existing call sites that import from `rootStore` keep working.
export { usePlaceInstanceStore };

export interface AppState {
  initialized: boolean;
}

// Placeholder root store — kept only so Redux DevTools has a single
// connection point under the shared `trains-app` store key. All real
// state lives in independent per-domain stores.
export const useRootStore = create<AppState>()(
  devtools(
    () => ({
      initialized: true,
    }),
    {
      name: 'TrainsAppStore',
      store: 'trains-app',
      enabled: import.meta.env.DEV,
    }
  )
);
