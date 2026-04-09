import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import CopyPlaceConnectionsModal from '../../components/CopyPlaceConnectionsModal';
import Drawer from '../../components/Drawer';
import Layout from '../../components/Layout';
import DeleteConfirmation from '../../components/DeleteConfirmation';
import PlaceConnectionsOptions from '../../components/PlaceConnectionsOptions';
import Toast from '../../components/Toast';
import { useAuthStore } from '../../store/authStore';
import { usePlaceConnectionStore } from '../../store/placeConnectionStore';
import { usePlaceStore } from '../../store/placeStore';
import { connectionVisible } from '../../utils/geometry';

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

// Fits the map to show all places in the `places` array.
// Uses `enabled` to control whether this runs - when disabled or already fitted, it does nothing.
// The `hasFitted` ref ensures this only runs once on initial page load, not on every re-render.
function FitBounds({ places, enabled }: { places: { lat: number; lng: number }[]; enabled: boolean }) {
  const map = useMap();
  const hasFitted = useRef(false);
  useEffect(() => {
    if (!enabled || hasFitted.current || places.length === 0) return;
    const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
    hasFitted.current = true;
  }, [enabled, places, map]);
  return null;
}

// Sets the map view to a single point (lat/lng) at a fixed zoom level.
// Used when user clicks the pin icon next to a place to focus on that place.
function MapFocus({ focus }: { focus: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (focus) {
      map.setView([focus.lat, focus.lng], 15);
    }
  }, [focus, map]);
  return null;
}

// Fits the map to show a specific connection (between two places).
// After fitting, listens for user map interactions (moveend) and calls onMove
// to signal that the pin should be cleared and normal map behavior restored.
function ConnectionFocus({ startId, endId, placesById, onMove }: { startId: string; endId: string; placesById: Record<string, any>; onMove: () => void }) {
  const map = useMap();
  useEffect(() => {
    const startPlace = placesById[startId];
    const endPlace = placesById[endId];
    if (startPlace && endPlace) {
      const bounds = L.latLngBounds([
        [startPlace.lat, startPlace.lng],
        [endPlace.lat, endPlace.lng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    const handleMoveEnd = () => {
      onMove();
    };
    map.on('moveend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [startId, endId, placesById, map, onMove]);
  return null;
}

function MapBoundsTracker({ onBoundsChange }: { onBoundsChange: (bounds: L.LatLngBounds) => void }) {
  const map = useMap();

  useEffect(() => {
    onBoundsChange(map.getBounds());

    const handleMoveEnd = () => {
      onBoundsChange(map.getBounds());
    };

    map.on('moveend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onBoundsChange]);

  return null;
}

export default function PlaceConnections() {
  const {
    allPlaceConnections,
    loading,
    error,
    fetchPlaceConnectionsByGameId,
    deletePlaceConnection,
    deleteAllPlaceConnections,
    copyPlaceConnections
  } = usePlaceConnectionStore();
  const { allPlaces, fetchPlacesByGameId } = usePlaceStore();
  const { currentGameId } = useAuthStore();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  // mapFocus: Single point to center the map on (used for place pin button)
  const [mapFocus, setMapFocus] = useState<{ lat: number; lng: number } | null>(null);
  // connectionToFocus: When set, shows a specific connection's endpoints fitting the map view
  const [connectionToFocus, setConnectionToFocus] = useState<{ startId: string; endId: string } | null>(null);
  // hasUserMovedMap: Tracks if user has manually moved the map after page load or after pinning.
  // Used to prevent FitBounds from overriding user-initiated map positions.
  const [hasUserMovedMap, setHasUserMovedMap] = useState(false);
  const [showVisible, setShowVisible] = useState(false);
  const [visibleBounds, setVisibleBounds] = useState<L.LatLngBounds | null>(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Redirect to home if no game is selected
  useEffect(() => {
    if (!currentGameId) {
      navigate('/');
      return;
    }
  }, [currentGameId, navigate]);

  useEffect(() => {
    if (currentGameId) {
      Promise.all([
        fetchPlaceConnectionsByGameId(currentGameId),
        fetchPlacesByGameId(currentGameId)
      ]);
    }
  }, [currentGameId, fetchPlaceConnectionsByGameId, fetchPlacesByGameId]);

  const handleAdd = () => {
    navigate('/game-admin/place-connections/add');
  };

  const handleEdit = (id: string) => navigate(`/game-admin/place-connections/${id}/edit`);
  
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setConfirming(true);
  };
  
  const handleConfirmDelete = async () => {
    if (deleteId && currentGameId) {
      await deletePlaceConnection(deleteId, currentGameId);
      setDeleteId(null);
      setConfirming(false);
    }
  };
  
  const handleCancelDelete = () => {
    setDeleteId(null);
    setConfirming(false);
  };

  const handleDeleteAll = () => {
    setShowDeleteAllConfirm(true);
  };

  const handleConfirmDeleteAll = async () => {
    if (currentGameId) {
      const deletedCount = await deleteAllPlaceConnections(currentGameId);
      setShowDeleteAllConfirm(false);
      setToastMessage(`Deleted ${deletedCount} connections.`);
      setToastType('success');
    }
  };

  const handleMapEdit = (id: string) => {
    handleEdit(id);
  };

  const handleMapDelete = (id: string) => {
    handleDelete(id);
  };

  // Pin button: Fit map to show the full connection between two places
  const handleShowOnMap = (connection: any) => {
    setConnectionToFocus({ startId: connection.startId, endId: connection.endId });
    setHasUserMovedMap(false); // Reset so FitBounds doesn't fight with ConnectionFocus
  };

  // Called when user moves the map after pinning a connection.
  // Clears the connection pin and marks that user has moved the map
  // so FitBounds won't override the user's chosen position.
  const handleMapMove = () => {
    setConnectionToFocus(null);
    setHasUserMovedMap(true);
  };

  const handleCopy = () => {
    setShowCopyModal(true);
  };

  const handleConfirmCopy = async (sourceGameId: string, overwrite: boolean) => {
    if (currentGameId) {
      const result = await copyPlaceConnections(sourceGameId, currentGameId, overwrite);
      const parts = [];
      if (result.copiedCount > 0) parts.push(`Copied ${result.copiedCount}`);
      if (result.overwrittenCount > 0) parts.push(`Overwritten ${result.overwrittenCount}`);
      if (result.skippedCount > 0) parts.push(`Skipped ${result.skippedCount} duplicates`);
      setToastMessage(parts.join('. ') + '.');
      setToastType('success');
    }
  };

  // Memoized lookup map for place ID -> place object.
  // Passed to ConnectionFocus to avoid re-creating the bounds on every render.
  const placesById = useMemo(() => allPlaces.reduce((acc, place) => {
    acc[place.id] = place;
    return acc;
  }, {} as Record<string, any>), [allPlaces]);

  const visiblePlaces = showVisible && visibleBounds
    ? allPlaces.filter(place => visibleBounds.contains([place.lat, place.lng]))
    : allPlaces;

  const visiblePlaceIds = new Set(visiblePlaces.map(p => p.id));

  const visibleConnections = showVisible && visibleBounds
    ? allPlaceConnections.filter(conn => {
        const startPlace = placesById[conn.startId];
        const endPlace = placesById[conn.endId];
        if (!startPlace || !endPlace) return false;
        return connectionVisible(startPlace, endPlace, visibleBounds);
      })
    : allPlaceConnections;

  return (
    <Layout title="Place Connections">
      <div className="flex flex-col lg:flex-row h-admin-content gap-4">
        {/* Table Section - Left Side */}
        <div className="w-full lg:w-120 lg:flex-shrink-0 bg-white shadow rounded-lg flex flex-col">
          <div className="px-6 py-3 border-b flex-shrink-0">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Place Connections ({visibleConnections.length})</h2>
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
{visibleConnections.map((connection, idx) => {
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
              {/*
                Map focus logic:
                - If connectionToFocus is set: show that connection fitting the map (ConnectionFocus takes over)
                - Otherwise: normal behavior with MapFocus (single point) and FitBounds (initial load only)
                
                FitBounds is enabled only when:
                1. User hasn't manually moved the map yet (hasUserMovedMap = false)
                2. No connection is being focused (connectionToFocus = null)
              */}
              {connectionToFocus ? (
                <ConnectionFocus startId={connectionToFocus.startId} endId={connectionToFocus.endId} placesById={placesById} onMove={handleMapMove} />
              ) : (
                <>
                  <MapFocus focus={mapFocus} />
                  <FitBounds places={allPlaces} enabled={!hasUserMovedMap && !connectionToFocus} />
                </>
              )}
              <MapBoundsTracker onBoundsChange={setVisibleBounds} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              
              {/* Draw all place markers */}
              {visiblePlaces.map((place, idx) => (
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
              {visibleConnections.map((connection, idx) => {
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

      <DeleteConfirmation
        isOpen={confirming}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        message="Are you sure you want to delete this connection? This action cannot be undone."
      />

      <Drawer side="right" title="Options">
        <PlaceConnectionsOptions
          showVisible={showVisible}
          onShowVisibleChange={setShowVisible}
          onCopy={handleCopy}
          onDeleteAll={handleDeleteAll}
          onImport={() => {}}
          onExport={() => {}}
        />
      </Drawer>

      <DeleteConfirmation
        isOpen={showDeleteAllConfirm}
        onConfirm={handleConfirmDeleteAll}
        onCancel={() => setShowDeleteAllConfirm(false)}
        message="Are you sure you want to delete all connections? This action cannot be undone."
      />

      <CopyPlaceConnectionsModal
        isOpen={showCopyModal}
        onClose={() => setShowCopyModal(false)}
        onCopy={handleConfirmCopy}
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

