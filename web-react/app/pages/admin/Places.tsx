import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { usePlaceStore } from '../../store/placeStore';

// Color mapping for place types
const typeColorMap: Record<string, string> = {
  RAIL: '#e53935', // red
  RESIDENCE: '#fbc02d', // yellow
  WAREHOUSE: '#3949ab', // blue
  PORT: '#00897b', // teal
  BUSINESS: '#8e24aa', // purple
  TRANSIT: '#43a047', // green
  YARD: '#6d4c41', // brown
  // Add more as needed
};

function getPinIcon(type: string) {
  const color = typeColorMap[type] || '#607d8b'; // default: blue-grey
  return new L.Icon({
    iconUrl:
      `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><path fill='${encodeURIComponent(color)}' d='M16 2C9.373 2 4 7.373 4 14c0 7.732 9.09 15.36 11.13 16.97a2 2 0 0 0 2.74 0C18.91 29.36 28 21.732 28 14c0-6.627-5.373-12-12-12zm0 18a6 6 0 1 1 0-12a6 6 0 0 1 0 12z'/></svg>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    shadowUrl: undefined,
  });
}

function FitBounds({ places }: { places: { lat: number; lng: number }[] }) {
  const map = useMap();
  useEffect(() => {
    if (places.length === 0) return;
    const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [places, map]);
  return null;
}

function MapFocus({ focus }: { focus: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (focus) {
      map.setView([focus.lat, focus.lng], 17);
    }
  }, [focus, map]);
  return null;
}

export default function Places() {
  const { places, loading, error, fetchPlaces, deletePlace } = usePlaceStore();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [mapFocus, setMapFocus] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const handleAdd = () => navigate('/admin/places/add');
  const handleEdit = (id: string) => navigate(`/admin/places/${id}/edit`);
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setConfirming(true);
  };
  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deletePlace(deleteId);
      setDeleteId(null);
      setConfirming(false);
    }
  };
  const handleCancelDelete = () => {
    setDeleteId(null);
    setConfirming(false);
  };

  return (
    <Layout title="Places">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between mb-4">
          <div></div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium"
          >
            + Add Place
          </button>
        </div>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latitude</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Longitude</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {places.map((place, idx) => (
                <tr key={place.id || idx}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{place.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{place.description}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{place.type}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{place.lat}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{place.lng}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm flex gap-2">
                    <button
                      onClick={() => setMapFocus({ lat: place.lat, lng: place.lng })}
                      className="text-blue-600 hover:text-blue-900"
                      title="Show on map"
                    >
                      📍
                    </button>
                    <button
                      onClick={() => handleEdit(place.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(place.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Confirmation Dialog */}
        {confirming && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm">
              <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
              <p className="mb-6">Are you sure you want to delete this place?</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Map below the table */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Map of Places</h2>
        <div style={{ height: 400, width: '100%' }}>
          <MapContainer
            style={{ height: '100%', width: '100%' }}
            center={places.length ? [places[0].lat, places[0].lng] : [0, 0]}
            zoom={13}
            scrollWheelZoom={true}
          >
            <MapFocus focus={mapFocus} />
            <FitBounds places={places} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {places.map((place, idx) => (
              <Marker
                key={place.id || idx}
                position={[place.lat, place.lng]}
                icon={getPinIcon(place.type)}
                draggable={false}
              >
                <Tooltip>{place.name}</Tooltip>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </Layout>
  );
} 