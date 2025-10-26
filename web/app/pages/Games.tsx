import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Pagination from '../components/Pagination';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { usePlayersStore } from '../store/playersStore';
import type { GameDto } from '../types/game';
import { GameType } from '../types/game';

export default function Games() {
  const { games, loading, error, fetchGames, page, limit, totalCount } = useGameStore();
  const { players, loading: playersLoading, fetchPlayersByUserId, addPlayer } = usePlayersStore();
  const { userId } = useAuthStore();

  // Modal state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameDto | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [playerDescription, setPlayerDescription] = useState('');
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchGames(page, limit);
  }, [fetchGames, page, limit]);

  useEffect(() => {
    if (userId) {
      fetchPlayersByUserId(userId);
    }
  }, [userId, fetchPlayersByUserId]);

  const handlePageChange = (newPage: number) => {
    fetchGames(newPage, limit);
  };

  const getGameTypeLabel = (type: GameType) => {
    switch (type) {
      case GameType.TEMPLATE:
        return 'Template';
      case GameType.GAME:
        return 'Game';
      default:
        return type;
    }
  };

  const getPlayerForGame = (gameId: string) => {
    return players.find(player => player.gameId === gameId);
  };

  const handleJoinGame = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (game) {
      setSelectedGame(game);
      setPlayerName('');
      setPlayerDescription('');
      setModalError('');
      setShowJoinModal(true);
    }
  };

  const handleModalClose = () => {
    setShowJoinModal(false);
    setSelectedGame(null);
    setPlayerName('');
    setPlayerDescription('');
    setModalError('');
    setIsSubmitting(false);
  };

  const handleModalSubmit = async () => {
    if (!userId || !selectedGame) return;

    if (!playerName.trim()) {
      setModalError('Player name is required');
      return;
    }

    setIsSubmitting(true);
    setModalError('');

    try {
      await addPlayer({
        name: playerName.trim(),
        description: playerDescription.trim(),
        userId: userId,
        gameId: selectedGame.id,
        wallet: {
          id: '',
          gold: 100,
          gems: 0,
          parts: 0,
          content: {}
        },
        content: {}
      });

      // Refresh both players and games data to update the UI
      await Promise.all([
        fetchPlayersByUserId(userId),
        fetchGames(page, limit)
      ]);
      handleModalClose();
    } catch (err: any) {
      setModalError(err.message || 'Failed to join game. Please try again.');
      setIsSubmitting(false);
    }
  };

  if ((loading || playersLoading) && games.length === 0) {
    return (
      <Layout title="Games">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading games...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Games">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Games</h1>
          <p className="mt-2 text-gray-600">Browse available games and join them to start playing</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {games.filter(game => game.type === GameType.GAME).length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <p className="text-gray-500">No games available to join at the moment.</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Places
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Your Player
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {games
                  .filter(game => game.type === GameType.GAME)
                  .map((game) => {
                    const player = getPlayerForGame(game.id);
                    return (
                      <tr key={game.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {game.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {game.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                            {getGameTypeLabel(game.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {game.places?.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {player ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {player.name}
                            </span>
                          ) : (
                          <button
                            onClick={() => handleJoinGame(game.id)}
                            className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200"
                          >
                            Join Game
                          </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {games.filter(game => game.type === GameType.GAME).length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(totalCount / limit)}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Join Game Modal */}
        {showJoinModal && selectedGame && (
          <div 
            className="fixed inset-0 bg-black/35 overflow-y-auto h-full w-full z-50"
            onClick={handleModalClose}
          >
            <div 
              className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Join Game
                </h3>

                {/* Game Information */}
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-1">{selectedGame.name}</h4>
                  <p className="text-sm text-gray-600">{selectedGame.description}</p>
                </div>

                {/* Error Message */}
                {modalError && (
                  <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                    {modalError}
                  </div>
                )}

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-1">
                      Player Name *
                    </label>
                    <input
                      type="text"
                      id="playerName"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your player name"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="playerDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Player Description
                    </label>
                    <textarea
                      id="playerDescription"
                      value={playerDescription}
                      onChange={(e) => setPlayerDescription(e.target.value)}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter a description for your player (optional)"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={handleModalClose}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleModalSubmit}
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
                  >
                    {isSubmitting ? 'Joining...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
