import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import DeleteConfirmation from '../../components/DeleteConfirmation';
import Toast from '../../components/Toast';
import { useAuthStore } from '../../store/authStore';
import { useVehicleStore } from '../../store/vehicleStore';
import { useTranslation } from 'react-i18next';

export default function Vehicles() {
  const { vehicles, loading, error, fetchVehiclesByGameId, deleteVehicle } = useVehicleStore();
  const { currentGameId } = useAuthStore();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const { t } = useTranslation();

  useEffect(() => {
    if (!currentGameId) {
      navigate('/');
      return;
    }
    fetchVehiclesByGameId(currentGameId);
  }, [currentGameId, fetchVehiclesByGameId, navigate]);

  const handleAdd = () => {
    navigate('/game-admin/vehicles/add');
  };

  const handleEdit = (id: string) => navigate(`/game-admin/vehicles/${id}/edit`);

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setConfirming(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId && currentGameId) {
      await deleteVehicle(deleteId, currentGameId);
      setDeleteId(null);
      setConfirming(false);
      setToastMessage('Vehicle deleted successfully.');
      setToastType('success');
    }
  };

  const handleCancelDelete = () => {
    setDeleteId(null);
    setConfirming(false);
  };

  return (
    <Layout title="Vehicles">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="px-6 py-3 border-b flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Vehicles ({vehicles.length})</h2>
            <button
              onClick={handleAdd}
              disabled={!currentGameId}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              + Add Vehicle
            </button>
          </div>
        </div>

        {loading && <div className="p-4">Loading...</div>}
        {error && <div className="p-4 text-red-500">{error}</div>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Speed</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engine</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (Gold)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (Gems)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehicles.map((vehicle, idx) => (
                  <tr key={vehicle.id || idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{vehicle.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{vehicle.description}</div>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {vehicle.type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{vehicle.speed}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      <div className="text-xs text-gray-500">
                        Max: {vehicle.engineMax} | Load: {vehicle.engineLoad} | Fuel: {vehicle.engineFuel}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{vehicle.priceGold}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{vehicle.priceGems}</td>
                    <td className="px-4 py-2 text-sm flex gap-1">
                      <button
                        onClick={() => handleEdit(vehicle.id)}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DeleteConfirmation
        isOpen={confirming}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        message="Are you sure you want to delete this vehicle? This action cannot be undone."
      />

      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
    </Layout>
  );
}