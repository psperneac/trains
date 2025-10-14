import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Pagination from '../../components/Pagination';
import { useGameStore } from '../../store/gameStore';
import { GameType } from '../../types/game';

export default function Games() {
  const { games, loading, error, fetchGames, deleteGame, page, limit, totalCount } = useGameStore();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetchGames(page, limit);
  }, [fetchGames, page, limit]);

  const handlePageChange = (newPage: number) => {
    fetchGames(newPage, limit);
  };

  const handleAdd = () => {
    navigate('/admin/games/new');
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/games/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setConfirming(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteGame(deleteId);
      setConfirming(false);
      setDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirming(false);
    setDeleteId(null);
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

  if (loading && games.length === 0) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading games...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Games</h1>
          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Game
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {games.map((game) => (
                <tr key={game.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {game.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {game.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getGameTypeLabel(game.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {game.places?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(game.id)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(game.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(totalCount / limit)}
            onPageChange={handlePageChange}
          />
        </div>

        {confirming && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Confirm Delete
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Are you sure you want to delete this game? This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleConfirmDelete}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Delete
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                  >
                    Cancel
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
