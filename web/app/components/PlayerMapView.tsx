import { useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Polyline, TileLayer } from 'react-leaflet';
import { FitBounds, MapFocus } from '../utils/map';
import PlaceMarker from './PlaceMarker';
import type { PlaceDto } from '../types/place';

interface PlaceWithOwnership extends PlaceDto {
  isOwned: boolean;
  placeInstanceId?: string;
  priceGold?: number;
  priceGems?: number;
}

interface PlayerMapViewProps {
  ownedPlaces: PlaceWithOwnership[];
  availablePlaces: PlaceWithOwnership[];
  connections: any[];
  selectedPlace: { lat: number; lng: number } | null;
  onPlaceClick: (place: PlaceWithOwnership, isOwned: boolean) => void;
}

// Color mapping for connection types
const connectionColorMap: Record<string, string> = {
  RAIL: '#e53935',
  ROAD: '#fbc02d',
  WATER: '#3949ab',
  AIR: '#00897b',
};

export default function PlayerMapView({
  ownedPlaces,
  availablePlaces,
  connections,
  selectedPlace,
  onPlaceClick,
}: PlayerMapViewProps) {
  console.log('OwnedPlaces', ownedPlaces, 'AvailablePlaces', availablePlaces, 'Connections', connections, 'SelectedPlace', selectedPlace);

  // All places combined for bounds calculation - only include places with valid coordinates
  const allPlaces = useMemo(() =>
    [...ownedPlaces, ...availablePlaces].filter(p => p && typeof p.lat === 'number' && typeof p.lng === 'number'),
    [ownedPlaces, availablePlaces]
  );

  // Fallback center if no valid places
  const mapCenter: [number, number] = allPlaces.length > 0
    ? [allPlaces[0].lat, allPlaces[0].lng]
    : [51.505, -0.09];

  // Get owned place template IDs for connection styling
  const ownedTemplateIds = useMemo(() => new Set(ownedPlaces.map(p => p.id)), [ownedPlaces]);

  // Filter connections to show - memoize to avoid recalculation
  const visibleConnections = useMemo(() => {
    const filtered = connections.filter(conn => {
      const startId = conn.startId?.toString();
      const endId = conn.endId?.toString();
      return startId && endId;
    });
    console.log('[PlayerMapView] connections:', { total: connections.length, filtered: filtered.length, sample: connections[0] });
    return filtered;
  }, [connections]);

  return (
    <div className="h-full w-full z-0">
      <MapContainer
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <MapFocus focus={selectedPlace} />
        <FitBounds places={allPlaces} />

        {/* Render connections */}
        {visibleConnections.map((conn, idx) => {
          const startId = conn.startId?.toString();
          const endId = conn.endId?.toString();
          const startOwned = ownedTemplateIds.has(startId);
          const endOwned = ownedTemplateIds.has(endId);

          // Color logic:
          // - Both owned: full color (connection between owned places)
          // - One or both unowned: grayed out (connection to/from available places)
          const isOwnedConnection = startOwned && endOwned;
          const color = connectionColorMap[conn.type] || '#607d8b';

          // Get coordinates from the connection's content or place lookup
          // This is a simplified version - actual implementation would need
          // to resolve place IDs to lat/lng coordinates
          const startPlace = allPlaces.find(p => p.id === startId);
          const endPlace = allPlaces.find(p => p.id === endId);

          if (!startPlace || !endPlace) return null;

          return (
            <Polyline
              key={`conn-${conn.id || idx}`}
              positions={[[startPlace.lat, startPlace.lng], [endPlace.lat, endPlace.lng]]}
              color={isOwnedConnection ? color : '#cccccc'}
              weight={isOwnedConnection ? 4 : 2}
              opacity={isOwnedConnection ? 0.8 : 0.5}
              dashArray={isOwnedConnection ? undefined : '5, 5'}
            />
          );
        })}
        {visibleConnections.length === 0 && connections.length > 0 && (
          <div className="absolute top-4 left-4 bg-yellow-100 p-2 rounded text-sm z-50">
            No visible connections (start/end IDs don't match any places)
          </div>
        )}

        {/* Render owned place markers */}
        {ownedPlaces.map((place, idx) => (
          <PlaceMarker
            key={`owned-${place.id || idx}`}
            place={place}
            onClick={() => onPlaceClick(place, true)}
          />
        ))}

        {/* Render available place markers */}
        {availablePlaces.map((place, idx) => (
          <PlaceMarker
            key={`available-${place.id || idx}`}
            place={place}
            onClick={() => onPlaceClick(place, false)}
          />
        ))}
      </MapContainer>
    </div>
  );
}