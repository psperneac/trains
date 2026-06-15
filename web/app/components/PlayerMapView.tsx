import { useMemo, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Polyline, TileLayer } from 'react-leaflet';
import { FitBounds, MapFocus } from '../utils/map';
import PlaceMarker from './PlaceMarker';
import type { PlaceDto } from '../types/place';
import type { MapViewData } from '~/store/playersStore';

// ---------------------------------------------------------------------------
// Status types
// ---------------------------------------------------------------------------
// These names mirror the PlayerMapView.md spec 1:1. The spec is the source of
// truth; the renderer is a dumb projector over these statuses.

export type PlaceStatus =
  | 'OWNED'
  | 'OWNED_ON_ROUTE'
  | 'OWNED_ROUTABLE'
  | 'NOT_OWNED'
  | 'NOT_OWNED_PURCHASEABLE';

export type ConnectionStatus =
  | 'INTERNAL'
  | 'INTERNAL_ON_ROUTE'
  | 'INTERNAL_ROUTABLE'
  | 'EXTERNAL'
  | 'EXTERNAL_PURCHASEABLE';

export type MapMode = 'NORMAL' | 'DISPATCH';

// Shape consumed by PlaceMarker. The model builder emits objects that
// satisfy this interface so the view layer does not have to translate.
export interface PlaceWithOwnership extends PlaceDto {
  isOwned: boolean;
  placeInstanceId?: string;
  priceGold?: number;
  priceGems?: number;
}

export interface PlaceView extends PlaceWithOwnership {
  status: PlaceStatus;
  // Resolved visual style — keeps JSX dumb.
  markerColor: string;
  markerOpacity: number;
  // False when the place is already in the route or unreachable during
  // route picking; PlaceMarker uses this to short-circuit click handlers.
  clickable: boolean;
}

export interface ConnectionView {
  id: string;
  startId: string;
  endId: string;
  type: string;
  status: ConnectionStatus;
  positions: [number, number][];
  color: string;
  weight: number;
  opacity: number;
  dashArray?: string;
}

export interface PlayerMapModel {
  mode: MapMode;
  center: [number, number];
  places: PlaceView[];
  connections: ConnectionView[];
  // Green polyline tracing the in-progress route. Empty when not in
  // DISPATCH mode or when the route has fewer than 2 stops.
  routePolyline: [number, number][];
}

// ---------------------------------------------------------------------------
// Color tables
// ---------------------------------------------------------------------------
// Status -> color. Type-color fallbacks for the SVG pin are owned by
// PlaceMarker.tsx (it is the only place that paints the pin); here we only
// resolve status colors so the spec's color rules are literal in code.

const PLACE_COLOR: Record<PlaceStatus, string> = {
  OWNED: '#e53935', // red
  OWNED_ON_ROUTE: '#1d4ed8', // blue
  OWNED_ROUTABLE: '#b91c1c', // darker red
  NOT_OWNED: '#cccccc',
  NOT_OWNED_PURCHASEABLE: '#9ca3af', // darker gray
};

const CONNECTION_COLOR: Record<ConnectionStatus, string> = {
  INTERNAL: '#e53935', // red
  INTERNAL_ON_ROUTE: '#1d4ed8', // blue
  INTERNAL_ROUTABLE: '#f5ca0c', // '#b91c1c', // darker red
  EXTERNAL: '#cccccc',
  EXTERNAL_PURCHASEABLE: '#404040' // '#9ca3af', // darker gray
};

// ---------------------------------------------------------------------------
// Shared helpers (mode-agnostic)
// ---------------------------------------------------------------------------

function ownedTemplateIds(mapViewData: MapViewData): Set<string> {
  const ids = new Set<string>();
  for (const pi of mapViewData.owned) {
    if (pi.place?.id !== undefined) ids.add(String(pi.place.id));
  }
  return ids;
}

function pickCenter(places: PlaceView[]): [number, number] {
  const first = places.find(
    (p) => typeof p.lat === 'number' && typeof p.lng === 'number'
  );
  return first ? [first.lat, first.lng] : [51.505, -0.09];
}

function statusToMarkerStyle(status: PlaceStatus): {
  color: string;
  opacity: number;
} {
  return {
    color: PLACE_COLOR[status],
    opacity: status === 'OWNED_ROUTABLE' ? 0.35 : 1,
  };
}

function statusToConnectionStyle(status: ConnectionStatus): {
  color: string;
  weight: number;
  opacity: number;
  dashArray?: string;
} {
  const highlighted =
    status === 'INTERNAL' ||
    status === 'INTERNAL_ON_ROUTE' ||
    status === 'INTERNAL_ROUTABLE' ||
    status === 'EXTERNAL_PURCHASEABLE';
  return highlighted
    ? { color: CONNECTION_COLOR[status], weight: 4, opacity: 0.8 }
    : { color: CONNECTION_COLOR[status], weight: 2, opacity: 0.3, dashArray: '5, 5' };
}

// ---------------------------------------------------------------------------
// Status resolution
// ---------------------------------------------------------------------------

function resolvePlaceStatus(args: {
  isOwned: boolean;
  isInRoute: boolean;
  isReachable: boolean;
  isPurchaseable: boolean;
  mode: MapMode;
}): PlaceStatus {
  const { isOwned, isInRoute, isReachable, isPurchaseable, mode } = args;
  if (isOwned) {
    if (isInRoute) return 'OWNED_ON_ROUTE';
    if (mode === 'DISPATCH' && isReachable) return 'OWNED_ROUTABLE';
    return 'OWNED';
  }
  if (isPurchaseable) return 'NOT_OWNED_PURCHASEABLE';
  return 'NOT_OWNED';
}

function resolveConnectionStatus(args: {
  startOwned: boolean;
  endOwned: boolean;
  startInRoute: boolean;
  endInRoute: boolean;
  mode: MapMode;
  route?: string[];
  startPlaceInstanceId?: string;
  endPlaceInstanceId?: string;
}): ConnectionStatus {
  const { startOwned, endOwned, startInRoute, endInRoute, mode, route = [], startPlaceInstanceId, endPlaceInstanceId } = args;
  // Route-picker active: only the route itself and its routable edge stand
  // out; everything else is dimmed (encoded as EXTERNAL by the renderer).
  if (mode === 'DISPATCH') {
    if (startInRoute && endInRoute) return 'INTERNAL_ON_ROUTE';

    if (startOwned && endOwned) {
      // INTERNAL_ROUTABLE: one end is the last place in the route, the other
      // end is NOT in the route (i.e., a valid next stop).
      const lastRouteInstanceId = route.length > 0 ? route[route.length - 1] : undefined;
      const startIsLast = lastRouteInstanceId && startPlaceInstanceId === lastRouteInstanceId;
      const endIsLast = lastRouteInstanceId && endPlaceInstanceId === lastRouteInstanceId;
      const startNotInRoute = startPlaceInstanceId && !route.includes(startPlaceInstanceId);
      const endNotInRoute = endPlaceInstanceId && !route.includes(endPlaceInstanceId);

      if ((startIsLast && endNotInRoute) || (endIsLast && startNotInRoute)) {
        return 'INTERNAL_ROUTABLE';
      }
      // Both owned but neither is the route endpoint → dimmed internal.
      return 'INTERNAL';
    }

    if (startOwned || endOwned) return 'EXTERNAL_PURCHASEABLE';
    return 'EXTERNAL';
  }
  if (startOwned && endOwned) return 'INTERNAL';
  if (startOwned || endOwned) return 'EXTERNAL_PURCHASEABLE';
  return 'EXTERNAL';
}

// ---------------------------------------------------------------------------
// Mode-specific builders
// ---------------------------------------------------------------------------

interface BuildOptions {
  selectedPlace: { lat: number; lng: number } | null;
  route?: string[];
  reachableNextPlaceInstanceIds?: Set<string>;
}

function buildNormalModel(
  mapViewData: MapViewData
): PlayerMapModel {
  const ownedTemplates = ownedTemplateIds(mapViewData);

  const places: PlaceView[] = [
    ...mapViewData.owned.map<PlaceView>((pi) => {
      const place = pi.place;
      const isPurchaseable = place
        ? mapViewData.available.some((a) => a.id === place.id)
        : false;
      const status = resolvePlaceStatus({
        isOwned: true,
        isInRoute: false,
        isReachable: false,
        isPurchaseable,
        mode: 'NORMAL',
      });
      const style = statusToMarkerStyle(status);
      return {
        ...(place as PlaceDto),
        isOwned: true,
        placeInstanceId: pi.id,
        status,
        markerColor: style.color,
        markerOpacity: style.opacity,
        clickable: true,
      };
    }),
    ...mapViewData.available
      .filter((p) => !ownedTemplates.has(String(p.id)))
      .map<PlaceView>((p) => {
        // A non-owned place is purchaseable when it sits one connection away
        // from any owned place.
        const isPurchaseable = mapViewData.connections.some((c) => {
          const s = c.startId?.toString();
          const e = c.endId?.toString();
          return (
            (s === String(p.id) && ownedTemplates.has(e)) ||
            (e === String(p.id) && ownedTemplates.has(s))
          );
        });
        const status = resolvePlaceStatus({
          isOwned: false,
          isInRoute: false,
          isReachable: false,
          isPurchaseable,
          mode: 'NORMAL',
        });
        const style = statusToMarkerStyle(status);
        return {
          ...p,
          isOwned: false,
          status,
          markerColor: style.color,
          markerOpacity: style.opacity,
          clickable: true,
        };
      }),
  ];

  const validPlaces = places.filter(
    (p) => typeof p.lat === 'number' && typeof p.lng === 'number'
  );
  const placeById = new Map(validPlaces.map((p) => [String(p.id), p]));

  const connections: ConnectionView[] = [];
  mapViewData.connections.forEach((conn, idx) => {
    const startId = conn.startId?.toString();
    const endId = conn.endId?.toString();
    if (!startId || !endId) return;
    const startPlace = placeById.get(startId);
    const endPlace = placeById.get(endId);
    if (!startPlace || !endPlace) return;

    const startOwned = startPlace.isOwned;
    const endOwned = endPlace.isOwned;
    const status = resolveConnectionStatus({
      startOwned,
      endOwned,
      startInRoute: false,
      endInRoute: false,
      mode: 'NORMAL',
      route: [],
      startPlaceInstanceId: undefined,
      endPlaceInstanceId: undefined,
    });
    const style = statusToConnectionStyle(status);
    connections.push({
      id: String(conn.id ?? `${idx}`),
      startId,
      endId,
      type: String(conn.type ?? ''),
      status,
      positions: [
        [startPlace.lat, startPlace.lng],
        [endPlace.lat, endPlace.lng],
      ],
      ...style,
    });
  });

  return {
    mode: 'NORMAL',
    center: pickCenter(validPlaces),
    places: validPlaces,
    connections,
    routePolyline: [],
  };
}

function buildDispatchModel(
  mapViewData: MapViewData,
  options: Required<Pick<BuildOptions, 'route' | 'reachableNextPlaceInstanceIds'>> & BuildOptions
): PlayerMapModel {
  const { route, reachableNextPlaceInstanceIds } = options;
  const ownedTemplates = ownedTemplateIds(mapViewData);
  const routeSet = new Set(route);

  // Build the green polyline tracing the in-progress route in order.
  const routePolyline: [number, number][] = [];
  for (const instanceId of route) {
    const pi = mapViewData.owned.find((p) => p.id === instanceId);
    if (pi?.place && typeof pi.place.lat === 'number' && typeof pi.place.lng === 'number') {
      routePolyline.push([pi.place.lat, pi.place.lng]);
    }
  }

  const places: PlaceView[] = [
    ...mapViewData.owned.map<PlaceView>((pi) => {
      const place = pi.place;
      const isInRoute = !!pi.place && routeSet.has(pi.id);
      const isReachable = reachableNextPlaceInstanceIds.has(pi.id);
      const status = resolvePlaceStatus({
        isOwned: true,
        isInRoute,
        isReachable,
        isPurchaseable: false,
        mode: 'DISPATCH',
      });
      const style = statusToMarkerStyle(status);
      return {
        ...(place as PlaceDto),
        isOwned: true,
        placeInstanceId: pi.id,
        status,
        markerColor: style.color,
        markerOpacity: style.opacity,
        // Already in route: nothing to do. Routable: not a stop yet either
        // way, just visually highlighted.
        clickable: !isInRoute,
      };
    }),
    ...mapViewData.available
      .filter((p) => !ownedTemplates.has(String(p.id)))
      .map<PlaceView>((p) => {
        // In dispatch mode, an unowned place is purchaseable when it is
        // adjacent (in either direction) to any owned place.
        const isPurchaseable = mapViewData.connections.some((c) => {
          const s = c.startId?.toString();
          const e = c.endId?.toString();
          return (
            (s === String(p.id) && ownedTemplates.has(e)) ||
            (e === String(p.id) && ownedTemplates.has(s))
          );
        });
        const status = resolvePlaceStatus({
          isOwned: false,
          isInRoute: false,
          isReachable: false,
          isPurchaseable,
          mode: 'DISPATCH',
        });
        const style = statusToMarkerStyle(status);
        return {
          ...p,
          isOwned: false,
          status,
          markerColor: style.color,
          markerOpacity: style.opacity,
          clickable: true,
        };
      }),
  ];

  const validPlaces = places.filter(
    (p) => typeof p.lat === 'number' && typeof p.lng === 'number'
  );
  const placeById = new Map(validPlaces.map((p) => [String(p.id), p]));

  const connections: ConnectionView[] = [];
  mapViewData.connections.forEach((conn, idx) => {
    const startId = conn.startId?.toString();
    const endId = conn.endId?.toString();
    if (!startId || !endId) return;
    const startPlace = placeById.get(startId);
    const endPlace = placeById.get(endId);
    if (!startPlace || !endPlace) return;

    const startOwned = startPlace.isOwned;
    const endOwned = endPlace.isOwned;
    const startInRoute = startPlace.placeInstanceId
      ? routeSet.has(startPlace.placeInstanceId)
      : false;
    const endInRoute = endPlace.placeInstanceId
      ? routeSet.has(endPlace.placeInstanceId)
      : false;
    const status = resolveConnectionStatus({
      startOwned,
      endOwned,
      startInRoute,
      endInRoute,
      mode: 'DISPATCH',
      route,
      startPlaceInstanceId: startPlace.placeInstanceId,
      endPlaceInstanceId: endPlace.placeInstanceId,
    });
    const style = statusToConnectionStyle(status);
    connections.push({
      id: String(conn.id ?? `${idx}`),
      startId,
      endId,
      type: String(conn.type ?? ''),
      status,
      positions: [
        [startPlace.lat, startPlace.lng],
        [endPlace.lat, endPlace.lng],
      ],
      ...style,
    });
  });

  return {
    mode: 'DISPATCH',
    center: pickCenter(validPlaces),
    places: validPlaces,
    connections,
    routePolyline,
  };
}

function buildModel(
  mapViewData: MapViewData,
  mode: MapMode,
  options: BuildOptions
): PlayerMapModel {
  if (mode === 'DISPATCH') {
    return buildDispatchModel(mapViewData, {
      ...options,
      route: options.route ?? [],
      reachableNextPlaceInstanceIds: options.reachableNextPlaceInstanceIds ?? new Set(),
    });
  }
  // NORMAL mode does not consume any of the per-render options.
  return buildNormalModel(mapViewData);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface PlayerMapViewProps {
  mapViewData: MapViewData;
  selectedPlace: { lat: number; lng: number } | null;
  onPlaceClick: (place: PlaceWithOwnership, isOwned: boolean) => void;
  // Dispatch mode - when active, clicking owned places goes to dispatch
  // handler instead of job board.
  dispatchMode?: boolean;
  onDispatchPlaceClick?: (placeInstanceId: string) => void;
  // Active route being built (place instance IDs, in order). Empty when not
  // in dispatch mode.
  route?: string[];
  // Set of place instance IDs that are valid next stops from the current
  // route endpoint.
  reachableNextPlaceInstanceIds?: Set<string>;
}

export default function PlayerMapView({
  mapViewData,
  selectedPlace,
  onPlaceClick,
  dispatchMode = false,
  onDispatchPlaceClick,
  route = [],
  reachableNextPlaceInstanceIds,
}: PlayerMapViewProps) {
  const model = useMemo(
    () =>
      buildModel(mapViewData, dispatchMode ? 'DISPATCH' : 'NORMAL', {
        selectedPlace,
        route,
        reachableNextPlaceInstanceIds,
      }),
    [
      mapViewData,
      dispatchMode,
      selectedPlace,
      route,
      reachableNextPlaceInstanceIds,
    ]
  );

  // Dev-only inspector — toggled with the keyboard shortcut below; lets a
  // developer confirm the model matches the PlayerMapView.md spec without
  // console-spamming.
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const showInspector = import.meta.env.DEV && inspectorOpen;

  // Mark places that PlaceMarker needs to know are part of the route / are
  // routable, so its existing click guards (markerState === 'inRoute' /
  // 'unreachable') keep working unchanged.
  const markerStateFor = (p: PlaceView): 'inRoute' | 'unreachable' | 'default' => {
    if (p.status === 'OWNED_ON_ROUTE') return 'inRoute';
    if (p.status === 'OWNED_ROUTABLE') return 'unreachable';
    return 'default';
  };

  return (
    <div className="h-full w-full z-0">
      <MapContainer
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        center={model.center}
        zoom={13}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <MapFocus focus={selectedPlace} />
        <FitBounds places={model.places} />

        {/* Connections */}
        {model.connections.map((c) => (
          <Polyline
            key={c.id}
            positions={c.positions}
            pathOptions={{
              color: c.color,
              weight: c.weight,
              opacity: c.opacity,
              dashArray: c.dashArray,
            }}
          />
        ))}

        {/* In-progress route (green) */}
        {model.routePolyline.length >= 2 && (
          <Polyline
            positions={model.routePolyline}
            pathOptions={{ color: '#16a34a', weight: 5, opacity: 0.9 }}
          />
        )}

        {/* Place markers */}
        {model.places.map((p) => (
          <PlaceMarker
            key={p.placeInstanceId ?? `available-${p.id}`}
            place={p}
            onClick={() => onPlaceClick(p, p.isOwned)}
            dispatchMode={model.mode === 'DISPATCH'}
            onDispatchClick={
              model.mode === 'DISPATCH' ? onDispatchPlaceClick : undefined
            }
            markerState={markerStateFor(p)}
          />
        ))}
      </MapContainer>

      {showInspector && (
        <div
          data-testid="player-map-inspector"
          className="absolute top-2 right-2 z-[1000] max-h-[80vh] w-[420px] overflow-auto rounded border border-gray-300 bg-white/95 p-2 text-xs shadow-lg"
        >
          <div className="mb-1 flex items-center justify-between">
            <strong>PlayerMapModel</strong>
            <button
              type="button"
              className="rounded bg-gray-200 px-2 py-0.5 hover:bg-gray-300"
              onClick={() => setInspectorOpen(false)}
            >
              close
            </button>
          </div>
          <pre className="whitespace-pre-wrap break-words font-mono">
            {JSON.stringify(
              {
                mode: model.mode,
                center: model.center,
                places: model.places.map((p) => ({
                  id: p.id,
                  instanceId: p.placeInstanceId,
                  status: p.status,
                  markerColor: p.markerColor,
                  clickable: p.clickable,
                })),
                connections: model.connections.map((c) => ({
                  id: c.id,
                  status: c.status,
                  color: c.color,
                  weight: c.weight,
                  opacity: c.opacity,
                })),
                routePolyline: model.routePolyline,
              },
              null,
              2
            )}
          </pre>
        </div>
      )}

      {import.meta.env.DEV && !inspectorOpen && (
        <button
          type="button"
          className="absolute bottom-2 right-2 z-[1000] rounded bg-gray-800 px-2 py-1 text-xs text-white shadow hover:bg-gray-700"
          onClick={() => setInspectorOpen(true)}
        >
          inspect model
        </button>
      )}
    </div>
  );
}
