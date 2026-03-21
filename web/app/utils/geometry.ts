import L from 'leaflet';

export interface LatLng {
  lat: number;
  lng: number;
}

export function boundsIntersect(a: L.LatLngBounds, b: { minLat: number; maxLat: number; minLng: number; maxLng: number }): boolean {
  return !(a.getNorth() < b.minLat || a.getSouth() > b.maxLat || a.getEast() < b.minLng || a.getWest() > b.maxLng);
}

export function getBoundingBox(places: LatLng[]): { minLat: number; maxLat: number; minLng: number; maxLng: number } | null {
  if (places.length === 0) return null;
  
  let minLat = places[0].lat;
  let maxLat = places[0].lat;
  let minLng = places[0].lng;
  let maxLng = places[0].lng;

  for (let i = 1; i < places.length; i++) {
    minLat = Math.min(minLat, places[i].lat);
    maxLat = Math.max(maxLat, places[i].lat);
    minLng = Math.min(minLng, places[i].lng);
    maxLng = Math.max(maxLng, places[i].lng);
  }

  return { minLat, maxLat, minLng, maxLng };
}

export function connectionVisible(
  start: LatLng,
  end: LatLng,
  visibleBounds: L.LatLngBounds
): boolean {
  const bbox = getBoundingBox([start, end]);
  if (!bbox) return false;
  return boundsIntersect(visibleBounds, bbox);
}
