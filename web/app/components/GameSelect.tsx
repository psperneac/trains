import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { usePlayersStore } from '../store/playersStore';
import type { GameDto } from '../types/game';

interface GameSelectProps {
  onGameChange?: (game: GameDto | null) => void;
}

export default function GameSelect({ onGameChange }: GameSelectProps) {
  const { allGames: games, fetchAllGames, loading, error } = useGameStore();
  const { currentGameId, currentGame, currentPlayer, setCurrentGame, setCurrentPlayer, isAdmin, userId } = useAuthStore();
  const { players, fetchPlayersByUserId, loading: playersLoading } = usePlayersStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllGames();
  }, [fetchAllGames]);

  useEffect(() => {
    if (userId && !isAdmin()) {
      fetchPlayersByUserId(userId);
    }
  }, [userId, fetchPlayersByUserId, isAdmin]);

  const handleGameChange = (gameId: string) => {
    const selectedGame = games.find(game => game.id === gameId);
    setCurrentGame(selectedGame || null);
    
    // Set current player for the selected game
    if (selectedGame && players.length > 0) {
      const playerForGame = players.find(player => player.gameId === gameId);
      setCurrentPlayer(playerForGame || null);
    } else {
      setCurrentPlayer(null);
    }
    
    onGameChange?.(selectedGame || null);
  };

  // For regular users, only show games they have players in
  const availableGames = isAdmin() 
    ? games 
    : games.filter(game => players.some(player => player.gameId === game.id));

  // Check if user has any players (for regular users)
  const hasPlayers = players.length > 0;

  // Check if there are games the user hasn't joined (for regular users)
  const availableGamesToJoin = games.filter(game => game.type === 'GAME');
  const hasUnjoinedGames = !isAdmin() && availableGamesToJoin.some(game =>
    !players.some(player => player.gameId === game.id)
  );

  const handleNavigateToGames = () => {
    navigate('/games');
  };

  return (
    <div className="space-y-4">
      {loading && (
        <div className="mb-4 text-sm text-gray-600">Loading games...</div>
      )}

      {error && (
        <div className="mb-4 text-sm text-red-600">Error loading games: {error}</div>
      )}

      {/* Show game selection only for admins or users with players */}
      {(isAdmin() || hasPlayers) && (
        <div>
          <label htmlFor="game-select" className="block text-sm font-medium text-gray-700 mb-2">
            Current Game
          </label>
          <select
            id="game-select"
            value={currentGameId || ''}
            onChange={(e) => handleGameChange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">
              {isAdmin() ? 'Select a game or template...' : 'Select a game...'}
            </option>
            {availableGames
              .filter(game => isAdmin() || game.type === 'GAME') // Admins see all, users see only games
              .map((game: GameDto) => (
                <option key={game.id} value={game.id}>
                  {game.name} {game.type === 'TEMPLATE' ? '(Template)' : ''}
                </option>
              ))}
          </select>
        </div>
      )}

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

      {!currentGame && isAdmin() && (
        <div className="bg-yellow-50 p-4 rounded-md">
          <p className="text-sm text-yellow-800">
            Please select a game to manage game features.
          </p>
        </div>
      )}
    </div>
  );
}
