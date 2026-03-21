import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';

export function FitBounds({ places }: { places: { lat: number; lng: number }[] }) {
  const map = useMap();
  useEffect(() => {
    if (places.length === 0) return;
    const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [places, map]);
  return null;
}

export function MapFocus({ focus, zoom = 17 }: { focus: { lat: number; lng: number } | null; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (focus) {
      map.setView([focus.lat, focus.lng], zoom);
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
    const center = map.getCenter();
    onPositionChange({
      lat: center.lat,
      lng: center.lng,
      zoom: map.getZoom()
    });
    if (onBoundsChange) {
      onBoundsChange(map.getBounds());
    }

    const handleMoveEnd = () => {
      const center = map.getCenter();
      onPositionChange({
        lat: center.lat,
        lng: center.lng,
        zoom: map.getZoom()
      });
      if (onBoundsChange) {
        onBoundsChange(map.getBounds());
      }
    };

    map.on('moveend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onPositionChange, onBoundsChange]);

  return null;
}
