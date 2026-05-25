import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { devtools } from 'zustand/middleware';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5001';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  connect: (token: string) => void;
  disconnect: () => void;
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler: (...args: any[]) => void) => void;
  emit: (event: string, data: any) => void;
  joinGame: (gameId: string, playerId: string) => void;
  leaveGame: (gameId: string, playerId: string) => void;
  requestFullSync: (gameId: string, playerId: string) => void;
}

export const useSocketStore = create<SocketState>()(
  devtools(
    (set, get) => ({
      socket: null,
      isConnected: false,

      connect: (token: string) => {
        const existingSocket = get().socket;
        if (existingSocket) {
          existingSocket.disconnect();
        }

        const socket = io(SERVER_URL + '/game', {
          auth: { token },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
          set({ isConnected: true });
        });

        socket.on('disconnect', () => {
          set({ isConnected: false });
        });

        set({ socket });
      },

      disconnect: () => {
        const socket = get().socket;
        if (socket) {
          socket.disconnect();
          set({ socket: null, isConnected: false });
        }
      },

      on: (event: string, handler: (...args: any[]) => void) => {
        const socket = get().socket;
        if (socket) {
          socket.on(event, handler);
        }
      },

      off: (event: string, handler: (...args: any[]) => void) => {
        const socket = get().socket;
        if (socket) {
          socket.off(event, handler);
        }
      },

      emit: (event: string, data: any) => {
        const socket = get().socket;
        if (socket && get().isConnected) {
          socket.emit(event, data);
        }
      },

      joinGame: (gameId: string, playerId: string) => {
        const socket = get().socket;
        if (socket && get().isConnected) {
          socket.emit('game:join', { gameId, playerId });
        }
      },

      leaveGame: (gameId: string, playerId: string) => {
        const socket = get().socket;
        if (socket && get().isConnected) {
          socket.emit('game:leave', { gameId, playerId });
        }
      },

      requestFullSync: (gameId: string, playerId: string) => {
        const socket = get().socket;
        if (socket && get().isConnected) {
          socket.emit('game:requestFullSync', { gameId, playerId });
        }
      },
    }),
    {
      name: 'socket-store',
      enabled: import.meta.env.DEV,
    }
  )
);