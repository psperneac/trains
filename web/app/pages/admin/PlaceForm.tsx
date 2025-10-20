import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { usePlaceStore } from '../../store/placeStore';
import { usePlaceTypeStore } from '../../store/placeTypeStore';
import type { PlaceDto } from '../../types/place';

// Fix default marker icon issue with Leaflet + Webpack
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom red pin SVG as a Leaflet icon
const redPinIcon = new L.Icon({
  iconUrl:
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="%23e53935" d="M16 2C9.373 2 4 7.373 4 14c0 7.732 9.09 15.36 11.13 16.97a2 2 0 0 0 2.74 0C18.91 29.36 28 21.732 28 14c0-6.627-5.373-12-12-12zm0 18a6 6 0 1 1 0-12a6 6 0 0 1 0 12z"/></svg>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowUrl: undefined,
});

const emptyPlace: Omit<PlaceDto, 'id'> = {
  name: '',
  description: '',
  type: '',
  lat: 0,
  lng: 0,
};

function DraggableMarker({ position, setPosition }: { position: [number, number]; setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    dragend: (_e) => {
      // Not used, marker handles dragend
    },
  });
  return (
    <Marker
      position={position}
      draggable={true as true}
      icon={redPinIcon}
      eventHandlers={{
        dragend: (e: L.LeafletEvent) => {
          const marker = e.target as L.Marker;
          const latlng = marker.getLatLng();
          setPosition([latlng.lat, latlng.lng]);
        },
      }}
    />
  );
}

function MapCenterer({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
  }, [position, map]);
  return null;
}

function MapPositionUpdater({ onUpdatePosition }: { onUpdatePosition: (pos: [number, number]) => void }) {
  const map = useMap();

  // Store the update function in a ref so it can be called from outside
  const updatePositionRef = useRef(onUpdatePosition);
  updatePositionRef.current = onUpdatePosition;

  useEffect(() => {
    const handleUpdatePosition = () => {
      const center = map.getCenter();
      updatePositionRef.current([center.lat, center.lng]);
    };

    // Expose the function globally for the button to use
    (window as any).updateMarkerToMapCenter = handleUpdatePosition;
  }, [map]);

  return null;
}

export default function PlaceForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { allPlaces, addPlace, updatePlace, fetchPlaces, loading, error } = usePlaceStore();
  const { placeTypes, fetchPlaceTypes } = usePlaceTypeStore();
  const isEdit = Boolean(id);

  // Get map position from navigation state if available
  const mapPosition = location.state?.mapPosition as { lat: number; lng: number; zoom: number } | undefined;

  // Memoize the current place from the store
  const currentPlace = useMemo(() => (isEdit ? allPlaces?.find((p) => p.id === id) : null), [isEdit, id, allPlaces]);
  const fetchedRef = useRef(false);

  const [form, setForm] = useState<Omit<PlaceDto, 'id'> | PlaceDto>(emptyPlace);
  const [markerPos, setMarkerPos] = useState<[number, number]>([0, 0]);
  const [mapReady, setMapReady] = useState(false);

  // Effect 1: Fetch places if needed
  useEffect(() => {
    if (isEdit && !currentPlace && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchPlaces();
    }
    // Fetch place types if not loaded
    if (placeTypes.length === 0) {
      fetchPlaceTypes();
    }
  }, [isEdit, currentPlace, fetchPlaces, placeTypes.length, fetchPlaceTypes]);

  // Effect 2: Set form state when currentPlace becomes available
  useEffect(() => {
    if (isEdit && currentPlace) {
      setForm(currentPlace);
      setMarkerPos([currentPlace.lat, currentPlace.lng]);
    }
  }, [isEdit, currentPlace]);

  // Effect 3: On add mode, get browser location for marker or use map position from navigation
  useEffect(() => {
    if (!isEdit && mapReady) {
      if (mapPosition) {
        setMarkerPos([mapPosition.lat, mapPosition.lng]);
        setForm((prev) => ({ ...prev, lat: mapPosition.lat, lng: mapPosition.lng }));
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setMarkerPos([pos.coords.latitude, pos.coords.longitude]);
            setForm((prev) => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude }));
          },
          () => {
            // fallback to default
            setMarkerPos([0, 0]);
          }
        );
      } else {
        setMarkerPos([0, 0]);
      }
    }
  }, [isEdit, mapReady, mapPosition]);

  // Keep marker in sync with form lat/lng
  useEffect(() => {
    if (form.lat !== markerPos[0] || form.lng !== markerPos[1]) {
      setMarkerPos([form.lat, form.lng]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.lat, form.lng]);

  // When marker is moved, update form lat/lng
  const handleMarkerMove = (pos: [number, number]) => {
    setMarkerPos(pos);
    setForm((prev) => ({ ...prev, lat: pos[0], lng: pos[1] }));
  };

  // Callback to update marker position to map center
  const handleUpdatePositionToMapCenter = useCallback((pos: [number, number]) => {
    setMarkerPos(pos);
    setForm((prev) => ({ ...prev, lat: pos[0], lng: pos[1] }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'lat' || name === 'lng' ? parseFloat(value) : value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      await updatePlace(form as PlaceDto);
    } else {
      await addPlace(form as Omit<PlaceDto, 'id'>);
    }
    navigate('/admin/places');
  };

  const handleCancel = () => navigate('/admin/places');

  const handleCenterMap = () => {
    if ((window as any).updateMarkerToMapCenter) {
      (window as any).updateMarkerToMapCenter();
    }
  };

  return (
    <Layout title={isEdit ? 'Edit Place' : 'Add Place'}>
      <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-11rem)]">
        <div className="bg-white shadow rounded-lg p-6 w-full lg:max-w-md lg:h-full">
          <form onSubmit={handleSave} className="space-y-4">
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700">ID</label>
                <input
                  type="text"
                  name="id"
                  value={(form as PlaceDto).id}
                  readOnly
                  className="mt-1 block w-full rounded border border-gray-300 bg-gray-100 text-gray-500 p-2"
                  style={{padding: '0.5rem'}}
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
                style={{padding: '0.5rem'}}
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
                style={{padding: '0.5rem'}}
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
                style={{padding: '0.5rem'}}
                disabled={placeTypes.length === 0}
              >
                {placeTypes.length === 0 ? (
                  <option value="">Loading types...</option>
                ) : (
                  <>
                    <option value="" disabled>Select a type...</option>
                    {placeTypes.map((pt) => (
                      <option key={pt.type} value={pt.type}>{pt.name}</option>
                    ))}
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Latitude</label>
              <input
                type="number"
                name="lat"
                value={form.lat}
                onChange={handleChange}
                required
                step="any"
                className="mt-1 block w-full rounded border border-gray-300 p-2"
                style={{padding: '0.5rem'}}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Longitude</label>
              <input
                type="number"
                name="lng"
                value={form.lng}
                onChange={handleChange}
                required
                step="any"
                className="mt-1 block w-full rounded border border-gray-300 p-2"
                style={{padding: '0.5rem'}}
              />
            </div>
            {error && <div className="text-red-500">{error}</div>}
            <div className="flex gap-2 justify-between items-center">
              <button
                type="button"
                onClick={handleCenterMap}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Center
              </button>
              <div className="flex gap-2">
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
            </div>
          </form>
        </div>
        <div className="flex-1 bg-white shadow rounded-lg p-6 lg:h-full">
          <h2 className="text-lg font-semibold mb-4">Map Location</h2>
          <div className="h-[500px]">
            <MapContainer
              center={markerPos as [number, number]}
              zoom={mapPosition?.zoom || 17}
              style={{ height: '100%', width: '100%' }}
              whenReady={() => setMapReady(true)}
            >
              <MapCenterer position={markerPos} />
              <MapPositionUpdater onUpdatePosition={handleUpdatePositionToMapCenter} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <DraggableMarker position={markerPos} setPosition={handleMarkerMove} />
            </MapContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
} 