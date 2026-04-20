import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import type { LatLng } from './geometry';

// Vehicle position interpolation (for future V2 use)
export function interpolatePosition(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  elapsed: number,
  total: number
): { lat: number; lng: number } {
  const ratio = Math.min(elapsed / total, 1);
  return {
    lat: start.lat + (end.lat - start.lat) * ratio,
    lng: start.lng + (end.lng - start.lng) * ratio,
  };
}

export function haversineDistance(p1: LatLng, p2: LatLng): number {
  const R = 6371;
  const dLat = toRad(p2.lat - p1.lat);
  const dLng = toRad(p2.lng - p1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function FitBounds({ places }: { places: { lat: number; lng: number }[] }) {
  const map = useMap();
  const hasInitiallyFitRef = useRef(false);

  useEffect(() => {
    if (!map || !places || places.length === 0) return;
    if (hasInitiallyFitRef.current) return;

    const validPlaces = places.filter(p => p && typeof p.lat === 'number' && typeof p.lng === 'number');
    if (validPlaces.length === 0) return;
    try {
      const bounds = L.latLngBounds(validPlaces.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
      hasInitiallyFitRef.current = true;
    } catch (e) {
      // Invalid bounds, ignore
    }
  }, [places, map]);
  return null;
}

export function MapFocus({ focus, zoom = 17 }: { focus: { lat: number; lng: number } | null; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !focus) return;
    if (typeof focus.lat !== 'number' || typeof focus.lng !== 'number') return;
    try {
      map.setView([focus.lat, focus.lng], zoom);
    } catch (e) {
      // Invalid coordinates, ignore
    }
  }, [focus, map, zoom]);
  return null;
}

export function MapBoundsTracker({ onBoundsChange }: { onBoundsChange: (bounds: L.LatLngBounds) => void }) {
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

export function MapPositionTracker({
  onPositionChange,
  onBoundsChange
}: {
  onPositionChange: (pos: { lat: number; lng: number; zoom: number }) => void;
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const emitPosition = () => {
      const center = map.getCenter();
      if (center && typeof center.lat === 'number' && typeof center.lng === 'number') {
        onPositionChange({
          lat: center.lat,
          lng: center.lng,
          zoom: map.getZoom()
        });
      }
    };

    emitPosition();

    const handleMoveEnd = () => {
      emitPosition();
    };

    map.on('moveend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onPositionChange, onBoundsChange]);

  return null;
}
