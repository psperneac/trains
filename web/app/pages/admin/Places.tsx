import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Pagination from '../../components/Pagination';
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

function MapPositionTracker({ onPositionChange }: { onPositionChange: (pos: { lat: number; lng: number; zoom: number }) => void }) {
  const map = useMap();

  useEffect(() => {
    const center = map.getCenter();
    onPositionChange({
      lat: center.lat,
      lng: center.lng,
      zoom: map.getZoom()
    });

    map.on('moveend', () => {
      const center = map.getCenter();
      onPositionChange({
        lat: center.lat,
        lng: center.lng,
        zoom: map.getZoom()
      });
    });

    return () => {
      map.off('moveend');
    };
  }, [map, onPositionChange]);

  return null;
}

export default function Places() {
  const { places, allPlaces, loading, error, fetchPlaces, fetchAllPlaces, deletePlace, page, limit, totalCount } = usePlaceStore();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [mapFocus, setMapFocus] = useState<{ lat: number; lng: number } | null>(null);
  const [mapPosition, setMapPosition] = useState<{ lat: number; lng: number; zoom: number } | null>(null);

  useEffect(() => {
    Promise.all([
      fetchPlaces(page, limit),
      fetchAllPlaces()
    ]);
  }, [fetchPlaces, fetchAllPlaces, page, limit]);

  const handlePageChange = (newPage: number) => {
    fetchPlaces(newPage, limit);
  };

  const handleAdd = () => {
    if (mapPosition) {
      navigate('/admin/places/add', { state: { mapPosition } });
    } else {
      navigate('/admin/places/add');
    }
  };

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

  const handleMapEdit = (id: string) => {
    handleEdit(id);
  };

  const handleMapDelete = (id: string) => {
    handleDelete(id);
  };

  return (
    <Layout title="Places">
      <div className="flex h-[calc(100vh-11rem)] gap-4">
        {/* Table Section - Left Side */}
        <div className="w-96 flex-shrink-0 bg-white shadow rounded-lg">
          <div className="px-6 py-3 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Places</h2>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium"
              >
                + Add Place
              </button>
            </div>
          </div>
          
          {loading && <div className="p-4">Loading...</div>}
          {error && <div className="p-4 text-red-500">{error}</div>}
          
          {!loading && !error && (
            <div className="overflow-y-auto h-[calc(100%-4rem)]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {places.map((place, idx) => (
                    <tr key={place.id || idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{place.name}</div>
                          <div className="text-xs text-gray-500 truncate">{place.description}</div>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {place.type}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm flex gap-1">
                        <button
                          onClick={() => setMapFocus({ lat: place.lat, lng: place.lng })}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Show on map"
                        >
                          📍
                        </button>
                        <button
                          onClick={() => handleEdit(place.id)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(place.id)}
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
          
          <div className="px-4 py-3 border-t">
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(totalCount / limit)}
              onPageChange={handlePageChange}
            />
          </div>
        </div>

        {/* Map Section - Right Side */}
        <div className="flex-1 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Map of Places</h2>
          <div className="h-[calc(100%-3rem)]">
            <MapContainer
              style={{ height: '100%', width: '100%' }}
              center={allPlaces.length ? [allPlaces[0].lat, allPlaces[0].lng] : [0, 0]}
              zoom={13}
              scrollWheelZoom={true}
            >
              <MapFocus focus={mapFocus} />
              <FitBounds places={allPlaces} />
              <MapPositionTracker onPositionChange={setMapPosition} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {allPlaces.map((place, idx) => (
                <Marker
                  key={place.id || idx}
                  position={[place.lat, place.lng]}
                  icon={getPinIcon(place.type)}
                  draggable={false}
                >
                  <Tooltip permanent>{place.name}</Tooltip>
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold">{place.name}</h3>
                      <p className="text-sm text-gray-600">{place.description}</p>
                      <p className="text-sm text-gray-500">Type: {place.type}</p>
                      <p className="text-sm text-gray-500">
                        Coordinates: {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => handleMapEdit(place.id)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleMapDelete(place.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirming && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirm Delete
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete this place? This action cannot be undone.
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
    </Layout>
  );
} 