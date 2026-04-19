import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../store/authStore';
import { useVehicleStore } from '../../store/vehicleStore';
import { useVehicleTypeStore } from '../../store/vehicleTypeStore';
import type { VehicleDto } from '../../types/vehicle';

const emptyVehicle: Omit<VehicleDto, 'id'> = {
  type: '',
  name: '',
  description: '',
  content: null,
  engineMax: 0,
  engineLoad: 0,
  engineFuel: 0,
  auxMax: 0,
  auxLoad: 0,
  auxFuel: 0,
  speed: 0,
  gameId: '',
  priceGold: 5000,
  priceGems: 10,
  fuelBaseBurn: 1,
  fuelPerLoadBurn: 0.1,
};

export default function VehicleForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentGameId } = useAuthStore();
  const { vehicles, addVehicle, updateVehicle, fetchVehiclesByGameId, loading, error } = useVehicleStore();
  const { vehicleTypes, fetchVehicleTypes } = useVehicleTypeStore();
  const isEdit = Boolean(id);

  useEffect(() => {
    if (!isEdit && !currentGameId) {
      navigate('/');
      return;
    }
  }, [isEdit, currentGameId, navigate]);

  const currentVehicle = useMemo(() => (isEdit ? vehicles?.find((v) => v.id === id) : null), [isEdit, id, vehicles]);
  const fetchedRef = useRef(false);

  const [form, setForm] = useState<Omit<VehicleDto, 'id'> | VehicleDto>(emptyVehicle);

  useEffect(() => {
    if (isEdit && !currentVehicle && !fetchedRef.current && currentGameId) {
      fetchedRef.current = true;
      fetchVehiclesByGameId(currentGameId);
    }
    if (vehicleTypes.length === 0) {
      fetchVehicleTypes();
    }
  }, [isEdit, currentVehicle, currentGameId, fetchVehiclesByGameId, vehicleTypes.length, fetchVehicleTypes]);

  useEffect(() => {
    if (isEdit && currentVehicle) {
      setForm(currentVehicle);
    }
  }, [isEdit, currentVehicle]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      if (name === 'content') {
        try {
          return { ...prev, [name]: JSON.parse(value) };
        } catch {
          return prev;
        }
      }
      if (['engineMax', 'engineLoad', 'engineFuel', 'auxMax', 'auxLoad', 'auxFuel', 'speed', 'priceGold', 'priceGems', 'fuelBaseBurn', 'fuelPerLoadBurn'].includes(name)) {
        return { ...prev, [name]: parseFloat(value) || 0 };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGameId) return;
    if (isEdit) {
      await updateVehicle({ ...form, gameId: currentGameId } as VehicleDto, currentGameId);
    } else {
      await addVehicle({ ...form, gameId: currentGameId } as Omit<VehicleDto, 'id'>, currentGameId);
    }
    navigate('/game-admin/vehicles');
  };

  const handleCancel = () => navigate('/game-admin/vehicles');

  return (
    <Layout title={isEdit ? 'Edit Vehicle' : 'Add Vehicle'}>
      <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
        <form onSubmit={handleSave} className="space-y-4">
          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700">ID</label>
              <input
                type="text"
                name="id"
                value={(form as VehicleDto).id}
                readOnly
                className="mt-1 block w-full rounded border border-gray-300 bg-gray-100 text-gray-500 p-2"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded border border-gray-300 p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded border border-gray-300 p-2"
              disabled={vehicleTypes.length === 0}
            >
              {vehicleTypes.length === 0 ? (
                <option value="">Loading types...</option>
              ) : (
                <>
                  <option value="" disabled>Select a type...</option>
                  {vehicleTypes.map((vt) => (
                    <option key={vt.type} value={vt.type}>{vt.name}</option>
                  ))}
                </>
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded border border-gray-300 p-2"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Engine Max</label>
              <input
                type="number"
                name="engineMax"
                value={form.engineMax}
                onChange={handleChange}
                required
                min="0"
                className="mt-1 block w-full rounded border border-gray-300 p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Engine Load</label>
              <input
                type="number"
                name="engineLoad"
                value={form.engineLoad}
                onChange={handleChange}
                required
                min="0"
                className="mt-1 block w-full rounded border border-gray-300 p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Engine Fuel</label>
              <input
                type="number"
                name="engineFuel"
                value={form.engineFuel}
                onChange={handleChange}
                required
                min="0"
                className="mt-1 block w-full rounded border border-gray-300 p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Aux Max</label>
              <input
                type="number"
                name="auxMax"
                value={form.auxMax}
                onChange={handleChange}
                required
                min="0"
                className="mt-1 block w-full rounded border border-gray-300 p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Aux Load</label>
              <input
                type="number"
                name="auxLoad"
                value={form.auxLoad}
                onChange={handleChange}
                required
                min="0"
                className="mt-1 block w-full rounded border border-gray-300 p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Aux Fuel</label>
              <input
                type="number"
                name="auxFuel"
                value={form.auxFuel}
                onChange={handleChange}
                required
                min="0"
                className="mt-1 block w-full rounded border border-gray-300 p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Speed</label>
              <input
                type="number"
                name="speed"
                value={form.speed}
                onChange={handleChange}
                required
                min="0"
                className="mt-1 block w-full rounded border border-gray-300 p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Price (Gold)</label>
              <input
                type="number"
                name="priceGold"
                value={form.priceGold}
                onChange={handleChange}
                required
                min="0"
                className="mt-1 block w-full rounded border border-gray-300 p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price (Gems)</label>
              <input
                type="number"
                name="priceGems"
                value={form.priceGems}
                onChange={handleChange}
                required
                min="0"
                className="mt-1 block w-full rounded border border-gray-300 p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fuel Base Burn</label>
              <input
                type="number"
                name="fuelBaseBurn"
                value={form.fuelBaseBurn}
                onChange={handleChange}
                required
                min="0"
                step="any"
                className="mt-1 block w-full rounded border border-gray-300 p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fuel Per Load Burn</label>
              <input
                type="number"
                name="fuelPerLoadBurn"
                value={form.fuelPerLoadBurn}
                onChange={handleChange}
                required
                min="0"
                step="any"
                className="mt-1 block w-full rounded border border-gray-300 p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Content (JSON)</label>
            <textarea
              name="content"
              value={typeof form.content === 'object' ? JSON.stringify(form.content, null, 2) : form.content || ''}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded border border-gray-300 p-2 font-mono text-sm"
              placeholder="{}"
            />
          </div>

          {error && <div className="text-red-500">{error}</div>}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}