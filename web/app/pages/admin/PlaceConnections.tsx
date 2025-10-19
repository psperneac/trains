import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { usePlaceConnectionStore } from '../../store/placeConnectionStore';
import { usePlaceStore } from '../../store/placeStore';

// Color mapping for connection types
const typeColorMap: Record<string, string> = {
  RAIL: '#e53935', // red
  ROAD: '#fbc02d', // yellow
  WATER: '#3949ab', // blue
  AIR: '#00897b', // teal
  // Add more as needed
};

function getPinIcon(color: string) {
  return new L.Icon({
    iconUrl:
      `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='8' fill='${encodeURIComponent(color)}' stroke='white' stroke-width='2'/></svg>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
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
      map.setView([focus.lat, focus.lng], 15);
    }
  }, [focus, map]);
  return null;
}

export default function PlaceConnections() {
  const { 
    allPlaceConnections,
    loading, 
    error, 
    fetchPlaceConnections, 
    deletePlaceConnection
  } = usePlaceConnectionStore();
  const { allPlaces, fetchAllPlaces } = usePlaceStore();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [mapFocus, setMapFocus] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    Promise.all([
      fetchPlaceConnections(),
      fetchAllPlaces()
    ]);
  }, [fetchPlaceConnections, fetchAllPlaces]);

  const handleAdd = () => {
    navigate('/admin/place-connections/add');
  };

  const handleEdit = (id: string) => navigate(`/admin/place-connections/${id}/edit`);
  
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setConfirming(true);
  };
  
  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deletePlaceConnection(deleteId);
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

  const handleShowOnMap = (connection: any) => {
    const startPlace = allPlaces.find(p => p.id === connection.startId);
    const endPlace = allPlaces.find(p => p.id === connection.endId);
    
    if (startPlace && endPlace) {
      // Focus on midpoint between start and end
      const midLat = (startPlace.lat + endPlace.lat) / 2;
      const midLng = (startPlace.lng + endPlace.lng) / 2;
      setMapFocus({ lat: midLat, lng: midLng });
    }
  };

  // Create a map of place IDs to place objects for quick lookup
  const placesById = allPlaces.reduce((acc, place) => {
    acc[place.id] = place;
    return acc;
  }, {} as Record<string, any>);

  return (
    <Layout title="Place Connections">
      <div className="flex flex-col lg:flex-row h-[calc(100vh-11rem)] gap-4">
        {/* Table Section - Left Side */}
        <div className="w-full lg:w-120 lg:flex-shrink-0 bg-white shadow rounded-lg flex flex-col">
          <div className="px-6 py-3 border-b flex-shrink-0">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Place Connections ({allPlaceConnections.length})</h2>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium"
              >
                + Add Connection
              </button>
            </div>
          </div>
          
          {loading && <div className="p-4">Loading...</div>}
          {error && <div className="p-4 text-red-500">{error}</div>}
          
          {!loading && !error && (
            <div className="overflow-y-auto flex-1">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allPlaceConnections.map((connection, idx) => {
                    const startPlace = placesById[connection.startId];
                    const endPlace = placesById[connection.endId];
                    
                    return (
                      <tr key={connection.id || idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{connection.name}</div>
                            <div className="text-xs text-gray-500 truncate">{connection.description}</div>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {connection.type}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          <div className="text-xs">
                            <div>{startPlace?.name || connection.startId}</div>
                            <div className="text-gray-400">→</div>
                            <div>{endPlace?.name || connection.endId}</div>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm flex gap-1">
                          <button
                            onClick={() => handleShowOnMap(connection)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Show on map"
                          >
                            📍
                          </button>
                          <button
                            onClick={() => handleEdit(connection.id)}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(connection.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Map Section - Right Side */}
        <div className="flex-1 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Connection Map</h2>
          <div className="h-[calc(100%-3rem)]">
            <MapContainer
              style={{ height: '100%', width: '100%' }}
              center={allPlaces.length ? [allPlaces[0].lat, allPlaces[0].lng] : [0, 0]}
              zoom={13}
              scrollWheelZoom={true}
            >
              <MapFocus focus={mapFocus} />
              <FitBounds places={allPlaces} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              
              {/* Draw all place markers */}
              {allPlaces.map((place, idx) => (
                <Marker
                  key={place.id || idx}
                  position={[place.lat, place.lng]}
                  icon={getPinIcon('#607d8b')}
                  draggable={false}
                >
                  <Tooltip>{place.name}</Tooltip>
                </Marker>
              ))}
              
              {/* Draw all connections as polylines */}
              {allPlaceConnections.map((connection, idx) => {
                const startPlace = placesById[connection.startId];
                const endPlace = placesById[connection.endId];
                
                if (!startPlace || !endPlace) return null;
                
                const positions: [number, number][] = [
                  [startPlace.lat, startPlace.lng],
                  [endPlace.lat, endPlace.lng]
                ];
                
                const color = typeColorMap[connection.type] || '#607d8b';
                
                return (
                  <Polyline
                    key={connection.id || idx}
                    positions={positions}
                    color={color}
                    weight={3}
                    opacity={0.7}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold">{connection.name}</h3>
                        <p className="text-sm text-gray-600">{connection.description}</p>
                        <p className="text-sm text-gray-500">Type: {connection.type}</p>
                        <p className="text-sm text-gray-500">
                          {startPlace.name} → {endPlace.name}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => handleMapEdit(connection.id)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleMapDelete(connection.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Polyline>
                );
              })}
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
                Are you sure you want to delete this connection? This action cannot be undone.
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

