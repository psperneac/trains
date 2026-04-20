import { Polyline, Tooltip } from 'react-leaflet';
import type { PlaceInstanceDto } from '../types/placeInstance';
import type { PlaceDto } from '../types/place';

interface RoutePickerOverlayProps {
  ownedPlaceInstances: PlaceInstanceDto[];
  route: string[];
  onPlaceClick: (placeInstanceId: string) => void;
  currentLocationId: string;
}

export default function RoutePickerOverlay({
  ownedPlaceInstances,
  route,
  onPlaceClick,
  currentLocationId,
}: RoutePickerOverlayProps) {
  // Get route positions for polyline
  const routePositions = route
    .map(id => {
      const pi = ownedPlaceInstances.find(p => p.id === id);
      if (pi?.place) {
        return [pi.place.lat, pi.place.lng] as [number, number];
      }
      return null;
    })
    .filter(pos => pos !== null) as [number, number][];

  // Get all waypoint positions for clickable markers
  const waypointPositions = ownedPlaceInstances
    .filter(pi => pi.place)
    .map(pi => ({
      id: pi.id,
      name: pi.place?.name || 'Unknown',
      lat: pi.place?.lat || 0,
      lng: pi.place?.lng || 0,
      isInRoute: route.includes(pi.id),
      isClickable: !route.includes(pi.id) || pi.id === route[route.length - 1],
    }));

  return (
    <>
      {/* Route polyline - rendered outside map due to overlay constraints */}
      {/* This is a visual indicator that will be shown via the map component */}
    </>
  );
}

// Export a helper function to get route positions for use in PlayerMapView
export function getRoutePositions(
  route: string[],
  ownedPlaceInstances: PlaceInstanceDto[]
): [number, number][] {
  return route
    .map(id => {
      const pi = ownedPlaceInstances.find(p => p.id === id);
      if (pi?.place) {
        return [pi.place.lat, pi.place.lng] as [number, number];
      }
      return null;
    })
    .filter(pos => pos !== null) as [number, number][];
}