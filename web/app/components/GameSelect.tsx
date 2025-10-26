import { useEffect } from 'react';
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

  // Use currentGame from store instead of finding it
  const selectedGame = currentGame;

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

      {/* Show loading state for players */}
      {!isAdmin() && playersLoading && (
        <div className="text-center">
          <p className="text-sm text-gray-600">Loading your players...</p>
        </div>
      )}

      {selectedGame && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium text-gray-900 mb-2">{selectedGame.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{selectedGame.description}</p>
          
          {currentPlayer && (
            <div className="mb-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
              <p className="text-sm font-medium text-blue-900">Your Player:</p>
              <p className="text-sm text-blue-700">{currentPlayer.name}</p>
              {currentPlayer.description && (
                <p className="text-xs text-blue-600 mt-1">{currentPlayer.description}</p>
              )}
            </div>
          )}
          
          <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded">
            Play {selectedGame.name}
          </button>
        </div>
      )}

      {!selectedGame && isAdmin() && (
        <div className="bg-yellow-50 p-4 rounded-md">
          <p className="text-sm text-yellow-800">
            Please select a game to manage game features.
          </p>
        </div>
      )}
    </div>
  );
}
