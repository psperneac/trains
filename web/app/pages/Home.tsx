import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import type { GameDto } from '../types/game';

export default function Home() {
  const { allGames: games, fetchAllGames, loading, error } = useGameStore();
  const { currentGameId, setCurrentGame, isAdmin } = useAuthStore();
  const [selectedGameId, setSelectedGameId] = useState<string>('');

  useEffect(() => {
    fetchAllGames();
  }, [fetchAllGames]);

  useEffect(() => {
    setSelectedGameId(currentGameId || '');
  }, [currentGameId]);

  const handleGameChange = (gameId: string) => {
    setSelectedGameId(gameId);
    setCurrentGame(gameId || null);
  };

  const selectedGame = games.find(game => game.id === selectedGameId);

  return (
    <Layout title="Home">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Current Game</h2>


        {loading && (
          <div className="mb-4 text-sm text-gray-600">Loading games...</div>
        )}

        {error && (
          <div className="mb-4 text-sm text-red-600">Error loading games: {error}</div>
        )}



        <div className="space-y-4">
          <div>
            <label htmlFor="game-select" className="block text-sm font-medium text-gray-700 mb-2">
              Current Game
            </label>
            <select
              id="game-select"
              value={selectedGameId}
              onChange={(e) => handleGameChange(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">
                {isAdmin() ? 'Select a game or template...' : 'Select a game...'}
              </option>
              {games
                .filter(game => isAdmin() || game.type === 'GAME') // Admins see all, users see only games
                .map((game: GameDto) => (
                  <option key={game.id} value={game.id}>
                    {game.name} {game.type === 'TEMPLATE' ? '(Template)' : ''}
                  </option>
                ))}
            </select>
          </div>

          {selectedGame && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-900 mb-2">{selectedGame.name}</h3>
              <p className="text-sm text-gray-600">{selectedGame.description}</p>
            </div>
          )}

          {!selectedGame && (
            <div className="bg-yellow-50 p-4 rounded-md">
              <p className="text-sm text-yellow-800">
                Please select {isAdmin() ? 'a game or template' : 'a game'} to access Place Connections.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 