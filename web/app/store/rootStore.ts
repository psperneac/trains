import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Simple root store that just initializes all stores for unified view
export const useRootStore = create()(
  devtools(
    (set, get) => ({
      // This is just a placeholder to make all stores visible in one place
      initialized: true,
    }),
    {
      name: 'all-stores', // Unified store name
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
