import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameSelect from '../components/GameSelect';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { usePlayersStore } from '../store/playersStore';
import { useRootStore } from '../store/rootStore';

export default function Home() {
  const { allGames: games, fetchAllGames } = useGameStore();
  const { isAdmin, userId, currentGameId, currentPlayer, setCurrentPlayer } = useAuthStore();
  const { players, fetchPlayersByUserId, loading: playersLoading } = usePlayersStore();
  const navigate = useNavigate();
  
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


  const handleNavigateToGames = () => {
    navigate('/games');
  };

  // Check if user has any players (for regular users)
  const hasPlayers = players.length > 0;

  // Check if there are games the user hasn't joined (for regular users)
  const availableGamesToJoin = games.filter(game => game.type === 'GAME');
  const hasUnjoinedGames = !isAdmin() && availableGamesToJoin.some(game => 
    !players.some(player => player.gameId === game.id)
  );

  return (
    <Layout title="Home">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Current Game</h2>

        <div className="space-y-4">
          <GameSelect />

          {/* Show "Join Games" button for users with unjoined games */}
          {hasUnjoinedGames && !playersLoading && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                {hasPlayers 
                  ? "There are more games available to join!" 
                  : "You haven't joined any games yet. Join a game to start playing!"
                }
              </p>
              <button
                onClick={handleNavigateToGames}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              >
                Join Games
              </button>
            </div>
          )}

          {/* Show loading state for players */}
          {!isAdmin() && playersLoading && (
            <div className="text-center">
              <p className="text-sm text-gray-600">Loading your players...</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 