import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../store/authStore';
import { useGameStore } from '../../store/gameStore';
import { usePlaceConnectionStore } from '../../store/placeConnectionStore';
import { usePlaceStore } from '../../store/placeStore';
import type { PlaceConnectionDto } from '../../types/placeConnection';

// Green pin for selected places
const greenPinIcon = new L.Icon({
  iconUrl:
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="%2343a047" d="M16 2C9.373 2 4 7.373 4 14c0 7.732 9.09 15.36 11.13 16.97a2 2 0 0 0 2.74 0C18.91 29.36 28 21.732 28 14c0-6.627-5.373-12-12-12zm0 18a6 6 0 1 1 0-12a6 6 0 0 1 0 12z"/></svg>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowUrl: undefined,
});

// Gray pin for non-selected places
const grayPinIcon = new L.Icon({
  iconUrl:
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="%23607d8b" stroke="white" stroke-width="2"/></svg>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
  shadowUrl: undefined,
});

const emptyConnection: Omit<PlaceConnectionDto, 'id'> = {
  name: '',
  description: '',
  type: 'RAIL',
  content: {},
  startId: '',
  endId: '',
  gameId: '', // Will be set from currentGameId
};

function FitBounds({ places }: { places: { id: string; lat: number; lng: number }[] }) {
  const map = useMap();
  useEffect(() => {
    if (places.length === 0) return;
    const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [places, map]);
  return null;
}

// Simple searchable select component
function SearchableSelect({
  label,
  value,
  options,
  onChange,
  required,
  placeholder
}: {
  label: string;
  value: string;
  options: { id: string; name: string }[];
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);
  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="mt-1 block w-full rounded border border-gray-300 p-2 cursor-pointer bg-white"
          style={{ padding: '0.5rem' }}
        >
          {selectedOption ? selectedOption.name : placeholder || 'Select...'}
        </div>
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
            <div className="p-2 border-b">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded p-1"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div>
              {filteredOptions.length === 0 ? (
                <div className="p-2 text-gray-500 text-sm">No results found</div>
              ) : (
                filteredOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => {
                      onChange(opt.id);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`p-2 cursor-pointer hover:bg-gray-100 ${
                      opt.id === value ? 'bg-blue-50' : ''
                    }`}
                  >
                    {opt.name}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlaceConnectionForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    allPlaceConnections,
    addPlaceConnection,
    updatePlaceConnection,
    fetchPlaceConnections,
    loading,
    error
  } = usePlaceConnectionStore();
  const { allPlaces, fetchAllPlaces } = usePlaceStore();
  const { allGames, fetchAllGames } = useGameStore();
  const { currentGameId } = useAuthStore();
  const isEdit = Boolean(id);

  // Redirect to home if no game is selected
  useEffect(() => {
    if (!currentGameId) {
      navigate('/');
      return;
    }
  }, [currentGameId, navigate]);

  const currentConnection = useMemo(
    () => (isEdit ? allPlaceConnections?.find((c) => c.id === id) : null),
    [isEdit, id, allPlaceConnections]
  );
  const fetchedRef = useRef(false);

  const [form, setForm] = useState<Omit<PlaceConnectionDto, 'id'> | PlaceConnectionDto>(() => ({
    ...emptyConnection,
    gameId: currentGameId || ''
  }));

  // Fetch data
  useEffect(() => {
    if (isEdit && !currentConnection && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchPlaceConnections();
    }
    if (allPlaces.length === 0) {
      fetchAllPlaces();
    }
    if (allGames.length === 0) {
      fetchAllGames();
    }
  }, [isEdit, currentConnection, fetchPlaceConnections, allPlaces.length, fetchAllPlaces, allGames.length, fetchAllGames]);

  // Set form when editing
  useEffect(() => {
    if (isEdit && currentConnection) {
      setForm(currentConnection);
    }
  }, [isEdit, currentConnection]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      await updatePlaceConnection(form as PlaceConnectionDto);
    } else {
      await addPlaceConnection(form as Omit<PlaceConnectionDto, 'id'>);
    }
    navigate('/admin/place-connections');
  };

  const handleCancel = () => navigate('/admin/place-connections');

  // Get selected places for map
  const startPlace = allPlaces.find((p) => p.id === form.startId);
  const endPlace = allPlaces.find((p) => p.id === form.endId);

  // Prepare places options for select
  const placeOptions = allPlaces.map((p) => ({ id: p.id, name: p.name }));
  const gameOptions = allGames.map((g) => ({ id: g.id, name: g.name }));

  // Connection types
  const connectionTypes = [
    { value: 'RAIL', label: 'Rail' },
    { value: 'ROAD', label: 'Road' },
    { value: 'WATER', label: 'Water' },
    { value: 'AIR', label: 'Air' },
  ];

  return (
    <Layout title={isEdit ? 'Edit Place Connection' : 'Add Place Connection'}>
      <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-11rem)]">
        <div className="bg-white shadow rounded-lg p-6 w-full lg:max-w-md lg:h-full">
          <form onSubmit={handleSave} className="space-y-4">
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700">ID</label>
                <input
                  type="text"
                  name="id"
                  value={(form as PlaceConnectionDto).id}
                  readOnly
                  className="mt-1 block w-full rounded border border-gray-300 bg-gray-100 text-gray-500 p-2"
                  style={{ padding: '0.5rem' }}
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
                style={{ padding: '0.5rem' }}
              />
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
                style={{ padding: '0.5rem' }}
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
                style={{ padding: '0.5rem' }}
              >
                {connectionTypes.map((ct) => (
                  <option key={ct.value} value={ct.value}>
                    {ct.label}
                  </option>
                ))}
              </select>
            </div>
            
            <SearchableSelect
              label="Start Place"
              value={form.startId}
              options={placeOptions}
              onChange={(value) => handleSelectChange('startId', value)}
              required
              placeholder="Select start place..."
            />

            <SearchableSelect
              label="End Place"
              value={form.endId}
              options={placeOptions}
              onChange={(value) => handleSelectChange('endId', value)}
              required
              placeholder="Select end place..."
            />

            <div>
              <label className="block text-sm font-medium text-gray-700">Game</label>
              <div className="mt-1 block w-full rounded border border-gray-300 bg-gray-100 p-2 text-gray-700 cursor-not-allowed">
                {gameOptions.find(g => g.id === form.gameId)?.name || 'No game selected'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Content (JSON)</label>
              <textarea
                name="content"
                value={typeof form.content === 'string' ? form.content : JSON.stringify(form.content, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setForm((prev) => ({ ...prev, content: parsed }));
                  } catch {
                    // Allow invalid JSON while typing
                    setForm((prev) => ({ ...prev, content: e.target.value }));
                  }
                }}
                rows={4}
                className="mt-1 block w-full rounded border border-gray-300 p-2 font-mono text-sm"
                style={{ padding: '0.5rem' }}
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
        <div className="flex-1 bg-white shadow rounded-lg p-6 lg:h-full">
          <h2 className="text-lg font-semibold mb-4">Connection Preview</h2>
          <div className="h-[500px]">
            <MapContainer
              center={allPlaces.length > 0 ? [allPlaces[0].lat, allPlaces[0].lng] : [0, 0]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <FitBounds places={allPlaces} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              
              {/* Draw all places */}
              {allPlaces.map((place) => {
                const isStart = place.id === form.startId;
                const isEnd = place.id === form.endId;
                const isSelected = isStart || isEnd;
                
                return (
                  <Marker
                    key={place.id}
                    position={[place.lat, place.lng]}
                    icon={isSelected ? greenPinIcon : grayPinIcon}
                  />
                );
              })}
              
              {/* Draw connection line if both places are selected */}
              {startPlace && endPlace && (
                <Polyline
                  positions={[
                    [startPlace.lat, startPlace.lng],
                    [endPlace.lat, endPlace.lng],
                  ]}
                  color="#43a047"
                  weight={4}
                  opacity={0.8}
                />
              )}
            </MapContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
}

