import L from 'leaflet';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import type { PlaceDto } from '../types/place';

interface PlaceWithOwnership extends PlaceDto {
  isOwned: boolean;
  placeInstanceId?: string;
  priceGold?: number;
  priceGems?: number;
}

interface PlaceMarkerProps {
  place: PlaceWithOwnership;
  onClick: () => void;
  // Dispatch mode - when active, owned place clicks go to dispatch handler instead of job board
  dispatchMode?: boolean;
  onDispatchClick?: (placeInstanceId: string) => void;
  // Visual state for the in-progress route. 'inRoute' tints the marker green
  // (already picked as a stop); 'unreachable' dims it (cannot be the next stop);
  // 'default' falls back to the normal type color.
  markerState?: 'default' | 'inRoute' | 'unreachable';
}

// Color mapping for place types
const typeColorMap: Record<string, string> = {
  RAIL: '#e53935',
  RESIDENCE: '#fbc02d',
  WAREHOUSE: '#3949ab',
  PORT: '#00897b',
  BUSINESS: '#8e24aa',
  TRANSIT: '#43a047',
  YARD: '#6d4c41',
};

// Grayscale colors for available (non-owned) places
const grayedColorMap: Record<string, string> = {
  RAIL: '#999999',
  RESIDENCE: '#aaaaaa',
  WAREHOUSE: '#888888',
  PORT: '#777777',
  BUSINESS: '#996699',
  TRANSIT: '#778877',
  YARD: '#886644',
};

function getPinIcon(type: string, isOwned: boolean, markerState: 'default' | 'inRoute' | 'unreachable' = 'default') {
  // Route-state colors override the type color
  let color: string;
  if (markerState === 'inRoute') {
    color = '#16a34a'; // green-600
  } else if (markerState === 'unreachable') {
    color = grayedColorMap[type] || '#9ca3af';
  } else {
    color = isOwned
      ? typeColorMap[type] || '#607d8b'
      : grayedColorMap[type] || '#888888';
  }

  // Apply reduced opacity for unreachable markers via SVG attribute
  const opacity = markerState === 'unreachable' ? '0.35' : '1';

  return new L.Icon({
    iconUrl:
      `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><path fill='${encodeURIComponent(color)}' fill-opacity='${opacity}' d='M16 2C9.373 2 4 7.373 4 14c0 7.732 9.09 15.36 11.13 16.97a2 2 0 0 0 2.74 0C18.91 29.36 28 21.732 28 14c0-6.627-5.373-12-12-12zm0 18a6 6 0 1 1 0-12a6 6 0 0 1 0 12z'/></svg>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    shadowUrl: undefined,
  });
}

export default function PlaceMarker({ place, onClick, dispatchMode = false, onDispatchClick, markerState = 'default' }: PlaceMarkerProps) {
  // Validate coordinates before rendering
  if (typeof place.lat !== 'number' || typeof place.lng !== 'number') {
    console.log('[PlaceMarker] Invalid coordinates:', place);
    return null;
  }

  const icon = getPinIcon(place.type, place.isOwned, markerState);

  // In dispatch mode, clicking directly adds to route - no popup
  const handleMarkerClick = (e: L.LeafletMouseEvent) => {
    // Block clicks on places that can't be added to the route
    if (markerState === 'unreachable') return;
    // Block re-clicking a place that's already in the route
    if (markerState === 'inRoute') return;

    if (!place.isOwned) {
      onClick();
      return;
    }

    if (dispatchMode && place.placeInstanceId && onDispatchClick) {
      // Directly add to route without showing popup
      onDispatchClick(place.placeInstanceId);
    }
    // Otherwise, Leaflet auto-opens the popup as usual
  };

  // Only show popup for owned places when NOT in dispatch mode
  const showPopup = place.isOwned && !dispatchMode;

  return (
    <Marker
      position={[place.lat, place.lng]}
      icon={icon}
      eventHandlers={{
        click: handleMarkerClick,
      }}
    >
      <Tooltip direction="top" offset={[0, -32]} permanent={false}>
        <div className="text-sm">
          <strong>{place.name}</strong>
          {place.isOwned && <span className="ml-1 text-green-600">(Owned)</span>}
          {!place.isOwned && place.priceGold !== undefined && (
            <span className="ml-1 text-gray-600">
              {place.priceGold}g{place.priceGems ? ` + ${place.priceGems}gems` : ''}
            </span>
          )}
        </div>
      </Tooltip>
      {showPopup && (
        <Popup>
          <div className="p-2 min-w-[150px]">
            <h3 className="font-semibold">{place.name}</h3>
            <p className="text-sm text-gray-600">{place.description}</p>
            <p className="text-xs text-gray-500 mt-1">Type: {place.type}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="mt-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
            >
              View Jobs
            </button>
          </div>
        </Popup>
      )}
    </Marker>
  );
}