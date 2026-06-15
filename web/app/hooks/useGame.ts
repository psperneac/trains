import { useAuthStore } from '~/store/authStore';
import { usePlaceInstanceStore } from '~/store/rootStore';
import { usePlayersStore } from '~/store/playersStore';

export function useGame() {

  const { currentPlayer } = useAuthStore();

  // Resolve playerId - use param or fallback to currentPlayer
  const resolvedPlayerId = currentPlayer?.id;

  const { placeInstancesByPlayer } = usePlaceInstanceStore(s => s);
  const { mapViewData } = usePlayersStore();

  const ownedPlaceInstances = resolvedPlayerId ? placeInstancesByPlayer[resolvedPlayerId] || [] : [];
  const ownedPlaceInstancesMap = new Map(ownedPlaceInstances.map((pi) => [pi.id, pi]));
  const ownedPlaceIds = new Set(ownedPlaceInstances.map(pi => pi.place?.id));

  // Compute the set of owned place instance IDs that are valid next stops
  // in the current route. A place is reachable if there is any connection
  // (in either direction) from the last stop's template place, and the
  // place is not already in the route.
  const getReachableNextPlaceInstanceIds = (isRoutePickerActive: boolean, route: string[]) => {
    console.log('getReachableNextPlaceInstanceIds', 'Route', route, 'MapViewData', mapViewData, 'Connections', mapViewData?.connections, 'PlaceInstancesByPlayer', placeInstancesByPlayer);

    if (!isRoutePickerActive || route.length === 0) {
      return new Set<string>();
    }

    const lastStopInstanceId = route[route.length - 1];
    const lastStop = ownedPlaceInstancesMap.get(lastStopInstanceId);
    if (!lastStop?.place) {
      return new Set<string>();
    }

    const lastTemplateId = lastStop.place.id;
    const neighborTemplateIds = new Set<string>();
    for (const conn of mapViewData?.connections ?? []) {
      if (conn.startId === lastTemplateId && ownedPlaceIds.has(conn.endId)) {
        neighborTemplateIds.add(String(conn.endId));
      } 
      else if (conn.endId === lastTemplateId && ownedPlaceIds.has(conn.startId)) {
        neighborTemplateIds.add(String(conn.startId));
      } 
    }

    const result = new Set<string>();
    for (const pi of ownedPlaceInstances) {
      if (route.includes(pi.id)) continue;        // already in route
      if (!pi.place) continue;
      if (!neighborTemplateIds.has(String(pi.place.id))) continue;
      result.add(pi.id);
    }
    console.log('getReachableNextPlaceInstanceIds.result', result);
    return result;
  };

  return {
    getReachableNextPlaceInstanceIds
  }
}
