import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Pagination from '../../components/Pagination';
import WalletDisplay from '../../components/WalletDisplay';
import { useAuthStore } from '../../store/authStore';
import { usePlayersStore } from '../../store/playersStore';
import { usePlaceInstanceStore } from '../../store/placeInstanceStore';
import { useVehicleInstanceStore } from '../../store/vehicleInstanceStore';
import type { PlayerDto } from '../../types/player';
import type { PlayerFullStateDto } from '../../types/player';

export default function Players() {
  const {
    players,
    loading,
    error,
    fetchPlayersByGameId,
    sendGoldAndGems,
    page,
    limit,
    totalCount
  } = usePlayersStore();
  const { currentGameId, currentGame, isAdmin } = useAuthStore();
  const { placeInstancesByPlayer, fetchPlaceInstancesByPlayerId } = usePlaceInstanceStore();
  const { vehicleInstancesByPlayer, fetchVehicleInstancesByPlayerId } = useVehicleInstanceStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Give modal state
  const [giveModalOpen, setGiveModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDto | null>(null);
  const [goldAmount, setGoldAmount] = useState<number>(0);
  const [gemsAmount, setGemsAmount] = useState<number>(0);
  const [partsAmount, setPartsAmount] = useState<number>(0);

  // Player detail modal state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsPlayer, setDetailsPlayer] = useState<PlayerDto | null>(null);

  // Debug modal state
  const [debugModalOpen, setDebugModalOpen] = useState(false);
  const [debugPlayer, setDebugPlayer] = useState<PlayerDto | null>(null);
  const [debugData, setDebugData] = useState<PlayerFullStateDto | null>(null);
  const [debugLoading, setDebugLoading] = useState(false);

  useEffect(() => {
    if (currentGameId) {
      fetchPlayersByGameId(currentGameId, page, limit);
    }
  }, [fetchPlayersByGameId, currentGameId, page, limit]);

  // Fetch place and vehicle instance counts for all players
  useEffect(() => {
    if (players.length > 0) {
      players.forEach(player => {
        fetchPlaceInstancesByPlayerId(player.id);
        fetchVehicleInstancesByPlayerId(player.id);
      });
    }
  }, [players, fetchPlaceInstancesByPlayerId, fetchVehicleInstancesByPlayerId]);

  const handlePageChange = (newPage: number) => {
    if (currentGameId) {
      fetchPlayersByGameId(currentGameId, newPage, limit);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setConfirming(true);
  };

  const handleConfirmDelete = async () => {
    // Note: deletePlayer method would need to be implemented in the store if needed
    // For now, just close the confirmation dialog
    setConfirming(false);
    setDeleteId(null);
  };

  const handleCancelDelete = () => {
    setConfirming(false);
    setDeleteId(null);
  };

  const handleGiveClick = (player: PlayerDto) => {
    setSelectedPlayer(player);
    setGoldAmount(0);
    setGemsAmount(0);
    setPartsAmount(0);
    setGiveModalOpen(true);
  };

  const handleGiveSubmit = async () => {
    if (!selectedPlayer) return;

    try {
      await sendGoldAndGems({
        playerId: selectedPlayer.id,
        gold: goldAmount,
        gems: gemsAmount,
        parts: partsAmount,
      });

      // Refresh the players list
      if (currentGameId) {
        await fetchPlayersByGameId(currentGameId, page, limit);
      }

      // Close modal and reset
      setGiveModalOpen(false);
      setSelectedPlayer(null);
      setGoldAmount(0);
      setGemsAmount(0);
      setPartsAmount(0);
    } catch (err) {
      console.error('Error sending gold and gems:', err);
    }
  };

  const handleGiveCancel = () => {
    setGiveModalOpen(false);
    setSelectedPlayer(null);
    setGoldAmount(0);
    setGemsAmount(0);
    setPartsAmount(0);
  };

  const handleDetailsClick = (player: PlayerDto) => {
    setDetailsPlayer(player);
    setDetailsModalOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsModalOpen(false);
    setDetailsPlayer(null);
  };

  const handleDebugClick = async (player: PlayerDto) => {
    setDebugPlayer(player);
    setDebugModalOpen(true);
    setDebugLoading(true);
    setDebugData(null);

    try {
      const fullState = await usePlayersStore.getState().fetchFullState(player.id);
      setDebugData(fullState);
    } catch (err) {
      console.error('Error fetching full state:', err);
    } finally {
      setDebugLoading(false);
    }
  };

  const handleDebugClose = () => {
    setDebugModalOpen(false);
    setDebugPlayer(null);
    setDebugData(null);
  };

  if (loading && players.length === 0) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading players...</div>
        </div>
      </Layout>
    );
  }

  if (!currentGameId) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-500">Please select a game to view players</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Players</h1>
            {currentGame && (
              <p className="text-lg text-gray-600 mt-1">
                Game: <span className="font-semibold">{currentGame.name} - {currentGame.description}</span>
              </p>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Total: {totalCount} players
          </div>
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
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wallet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Places
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {players.map((player) => (
                <tr key={player.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {player.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {player.description || 'No description'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {player.userId}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <WalletDisplay wallet={player.wallet} showHidden={isAdmin()} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {placeInstancesByPlayer[player.id]?.length ?? '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicleInstancesByPlayer[player.id]?.length ?? '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDetailsClick(player)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded text-sm mr-2"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleGiveClick(player)}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-3 rounded text-sm mr-2"
                    >
                      Give
                    </button>
                    {isAdmin() && (
                      <button
                        onClick={() => handleDebugClick(player)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-1 px-3 rounded text-sm"
                        title="Debug: View full state"
                      >
                        Debug
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {players.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No players found for this game.
          </div>
        )}

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
                  Player Details
                </h3>
                {deleteId && (
                  <div className="text-sm text-gray-600 mb-4">
                    <p><strong>Player ID:</strong> {deleteId}</p>
                    <p className="mt-2">
                      Detailed player management features can be implemented here.
                    </p>
                  </div>
                )}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleConfirmDelete}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Close
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

        {giveModalOpen && selectedPlayer && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
                  Give Resources to {selectedPlayer.name}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="gold" className="block text-sm font-medium text-gray-700 mb-1">
                      Gold
                    </label>
                    <input
                      type="number"
                      id="gold"
                      min="0"
                      value={goldAmount}
                      onChange={(e) => setGoldAmount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter gold amount"
                    />
                  </div>

                  <div>
                    <label htmlFor="gems" className="block text-sm font-medium text-gray-700 mb-1">
                      Gems
                    </label>
                    <input
                      type="number"
                      id="gems"
                      min="0"
                      value={gemsAmount}
                      onChange={(e) => setGemsAmount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter gems amount"
                    />
                  </div>

                  <div>
                    <label htmlFor="parts" className="block text-sm font-medium text-gray-700 mb-1">
                      Parts
                    </label>
                    <input
                      type="number"
                      id="parts"
                      min="0"
                      value={partsAmount}
                      onChange={(e) => setPartsAmount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter parts amount"
                    />
                  </div>
                </div>

                <div className="flex justify-between space-x-4 mt-6">
                  <button
                    onClick={handleGiveCancel}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGiveSubmit}
                    disabled={goldAmount === 0 && gemsAmount === 0 && partsAmount === 0}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {detailsModalOpen && detailsPlayer && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
                  Player Details: {detailsPlayer.name}
                </h3>

                {/* Place Instances Section */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-2 border-b pb-1">
                    Place Instances ({placeInstancesByPlayer[detailsPlayer.id]?.length ?? 0})
                  </h4>
                  {placeInstancesByPlayer[detailsPlayer.id]?.length > 0 ? (
                    <div className="space-y-2">
                      {placeInstancesByPlayer[detailsPlayer.id].map((placeInstance) => (
                        <div key={placeInstance.id} className="bg-gray-50 rounded p-3 text-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-semibold text-gray-900">
                                {placeInstance.place?.name || 'Unknown Place'}
                              </span>
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                {placeInstance.place?.type || 'Unknown Type'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 font-mono">
                              ID: {placeInstance.id.slice(-8)}
                            </span>
                          </div>
                          <div className="mt-1 text-gray-600">
                            <span>Coords: </span>
                            <span className="font-mono text-xs">
                              {placeInstance.place?.lat?.toFixed(4)}, {placeInstance.place?.lng?.toFixed(4)}
                            </span>
                          </div>
                          {placeInstance.jobOffers && placeInstance.jobOffers.length > 0 && (
                            <div className="mt-1 text-xs text-green-600">
                              {placeInstance.jobOffers.length} job offer(s) available
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No place instances</p>
                  )}
                </div>

                {/* Vehicle Instances Section */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-2 border-b pb-1">
                    Vehicle Instances ({vehicleInstancesByPlayer[detailsPlayer.id]?.length ?? 0})
                  </h4>
                  {vehicleInstancesByPlayer[detailsPlayer.id]?.length > 0 ? (
                    <div className="space-y-2">
                      {vehicleInstancesByPlayer[detailsPlayer.id].map((vehicleInstance) => (
                        <div key={vehicleInstance.id} className="bg-gray-50 rounded p-3 text-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-semibold text-gray-900">
                                {vehicleInstance.vehicle?.name || 'Unknown Vehicle'}
                              </span>
                              <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                                {vehicleInstance.vehicle?.type || 'Unknown Type'}
                              </span>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              vehicleInstance.status === 'AT_PLACE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {vehicleInstance.status === 'AT_PLACE' ? 'At Place' : 'In Transit'}
                            </span>
                          </div>
                          <div className="mt-1 text-gray-600">
                            <span>Location: </span>
                            <span className="font-mono text-xs">
                              {vehicleInstance.currentPlaceInstance?.place?.name || 'Unknown'}
                              {vehicleInstance.status === 'IN_TRANSIT' && vehicleInstance.destinationPlaceInstance?.place?.name && (
                                <span> → {vehicleInstance.destinationPlaceInstance.place.name}</span>
                              )}
                            </span>
                          </div>
                          {vehicleInstance.vehicle && (
                            <div className="mt-1 text-xs text-gray-500">
                              Speed: {vehicleInstance.vehicle.speed} | Fuel burn: {vehicleInstance.vehicle.fuelBaseBurn} base + {vehicleInstance.vehicle.fuelPerLoadBurn}/load
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No vehicle instances</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleDetailsClose}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {debugModalOpen && debugPlayer && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
                  Debug: {debugPlayer.name}
                </h3>

                {debugLoading && (
                  <div className="text-center py-8">
                    <div className="text-lg">Loading...</div>
                  </div>
                )}

                {!debugLoading && debugData && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-md font-semibold text-gray-800 mb-2 border-b pb-1">
                        Player Data
                      </h4>
                      <pre className="bg-gray-50 rounded p-3 text-xs overflow-x-auto max-h-64">
                        {JSON.stringify(debugData.player, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <h4 className="text-md font-semibold text-gray-800 mb-2 border-b pb-1">
                        Place Instances ({debugData.placeInstances?.length ?? 0})
                      </h4>
                      {debugData.placeInstances?.length > 0 ? (
                        <pre className="bg-gray-50 rounded p-3 text-xs overflow-x-auto max-h-64">
                          {JSON.stringify(debugData.placeInstances, null, 2)}
                        </pre>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No place instances</p>
                      )}
                    </div>

                    <div>
                      <h4 className="text-md font-semibold text-gray-800 mb-2 border-b pb-1">
                        Vehicle Instances ({debugData.vehicleInstances?.length ?? 0})
                      </h4>
                      {debugData.vehicleInstances?.length > 0 ? (
                        <pre className="bg-gray-50 rounded p-3 text-xs overflow-x-auto max-h-64">
                          {JSON.stringify(debugData.vehicleInstances, null, 2)}
                        </pre>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No vehicle instances</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleDebugClose}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
