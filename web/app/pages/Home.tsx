import { useEffect } from 'react';
import GameInfoCard from '../components/GameInfoCard';
import GameSelect from '../components/GameSelect';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { usePlayersStore } from '../store/playersStore';
import { useRootStore } from '../store/rootStore';

export default function Home() {
  const { fetchAllGames } = useGameStore();
  const { userId, currentGameId, currentGame, currentPlayer, setCurrentPlayer } = useAuthStore();
  const { players, fetchPlayersByUserId } = usePlayersStore();
  
  // Initialize root store for unified Redux DevTools view
  useRootStore();

  // Force initialization of stores for Redux DevTools
  useEffect(() => {
    fetchAllGames();
    // Force players store to initialize if user exists
    if (userId) {
      fetchPlayersByUserId(userId);
    }
  }, [fetchAllGames, fetchPlayersByUserId, userId]);

  // Set current player when game changes or when players are loaded
  useEffect(() => {
    if (currentGameId && players.length > 0) {
      const playerForCurrentGame = players.find(player => player.gameId === currentGameId);
      if (playerForCurrentGame) {
        setCurrentPlayer(playerForCurrentGame);
      } else {
        setCurrentPlayer(null);
      }
    } else if (!currentGameId) {
      setCurrentPlayer(null);
    }
  }, [currentGameId, players, setCurrentPlayer]);

  // Smart player selection: if we have a game but no current player, find and set it
  useEffect(() => {
    if (currentGameId && !currentPlayer && players.length > 0) {
      const playerForCurrentGame = players.find(player => player.gameId === currentGameId);
      if (playerForCurrentGame) {
        setCurrentPlayer(playerForCurrentGame);
      }
    }
  }, [currentGameId, currentPlayer, players, setCurrentPlayer]);

  return (
    <Layout title="Home">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Current Game</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Game Selection Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <GameSelect />
          </div>

          {/* Game Info Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <GameInfoCard game={currentGame} />
          </div>
        </div>
      </div>
    </Layout>
  );
} 