import { useEffect, useRef } from 'react';
import { useSocketStore } from '../store/socket';

export function useGameSocket(gameId: string, playerId: string) {
  const isConnected = useSocketStore((s) => s?.isConnected);
  const connect = useSocketStore((s) => s?.connect);
  const joinGame = useSocketStore((s) => s?.joinGame);
  const leaveGame = useSocketStore((s) => s?.leaveGame);
  const hasConnected = useRef(false);

  useEffect(() => {
    console.log('In connect effect', gameId, playerId, isConnected);
    if (!gameId || !playerId) return;

    const token = localStorage.getItem('authToken') || '';
    if (!hasConnected.current && token) {
      connect(token);
      hasConnected.current = true;
    }

    if (isConnected) {
      joinGame(gameId, playerId);
    }
  }, [gameId, playerId, isConnected, connect, joinGame]);

  useEffect(() => {
    return () => {
      if (gameId && playerId) {
        leaveGame(gameId, playerId);
      }
    };
  }, [gameId, playerId, leaveGame]);

  return { isConnected };
}