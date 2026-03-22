import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '../config/api';
import type { AdminUserDto, PageDto, SendGoldAndGemsToUserDto } from '../types/user';
import { useAuthStore } from './authStore';

interface AdminUserState {
  users: AdminUserDto[];
  totalCount: number;
  page: number;
  limit: number;
  
  loading: boolean;
  error: string | null;
  
  fetchUsers: (page?: number, limit?: number) => Promise<void>;
  fetchUser: (userId: string) => Promise<AdminUserDto>;
  resetPassword: (userId: string, newPassword: string) => Promise<void>;
  sendGoldAndGems: (sendDto: SendGoldAndGemsToUserDto) => Promise<AdminUserDto>;
}

export const useAdminUserStore = create<AdminUserState>()(
  devtools(
    (set, get) => ({
      users: [],
      totalCount: 0,
      page: 1,
      limit: 10,
      
      loading: false,
      error: null,

      fetchUsers: async (page = 1, limit = 10) => {
        set({ loading: true, error: null });
        try {
          const rawToken = useAuthStore.getState().authToken;
          const authToken = typeof rawToken === 'string' ? rawToken : undefined;
          
          const response = await apiRequest<PageDto<AdminUserDto>>(
            `/api/admin/users?page=${page}&limit=${limit}`,
            { method: 'GET', authToken }
          );
          
          set({
            users: response.data,
            totalCount: response.totalCount,
            page: response.page,
            limit: response.limit,
            loading: false
          });
        } catch (err: any) {
          set({ error: err.message || 'Unknown error', loading: false });
        }
      },
      
      fetchUser: async (userId: string) => {
        set({ loading: true, error: null });
        try {
          const rawToken = useAuthStore.getState().authToken;
          const authToken = typeof rawToken === 'string' ? rawToken : undefined;
          
          const response = await apiRequest<AdminUserDto>(
            `/api/admin/user/${userId}`,
            { method: 'GET', authToken }
          );
          
          set({ loading: false });
          return response;
        } catch (err: any) {
          set({ error: err.message || 'Unknown error', loading: false });
          throw err;
        }
      },

      resetPassword: async (userId: string, newPassword: string) => {
        set({ loading: true, error: null });
        try {
          const rawToken = useAuthStore.getState().authToken;
          const authToken = typeof rawToken === 'string' ? rawToken : undefined;
          
          await apiRequest<{ message: string }>(
            `/api/admin/user/${userId}/reset-password`,
            { method: 'POST', authToken, body: JSON.stringify({ newPassword }) }
          );
          
          set({ loading: false });
        } catch (err: any) {
          set({ error: err.message || 'Unknown error', loading: false });
          throw err;
        }
      },

      sendGoldAndGems: async (sendDto: SendGoldAndGemsToUserDto) => {
        set({ loading: true, error: null });
        try {
          const rawToken = useAuthStore.getState().authToken;
          const authToken = typeof rawToken === 'string' ? rawToken : undefined;
          
          const response = await apiRequest<AdminUserDto>(
            `/api/admin/user/${sendDto.userId}/send`,
            { method: 'POST', authToken, body: JSON.stringify(sendDto) }
          );
          
          set({ loading: false });
          return response;
        } catch (err: any) {
          set({ error: err.message || 'Unknown error', loading: false });
          throw err;
        }
      },
    }),
    {
      name: 'admin-users-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
