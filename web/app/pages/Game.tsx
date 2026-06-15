import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import WalletDisplay from '../components/WalletDisplay';
import GameControlPanel from '../components/GameControlPanel';
import PlayerMapView from '../components/PlayerMapView';
import BuyPlaceModal from '../components/BuyPlaceModal';
import JobBoard from '../components/JobBoard';
import VehicleDispatchPanel from '../components/VehicleDispatchPanel';
import { useAuthStore } from '../store/authStore';
import { usePlaceInstanceStore } from '../store/placeInstanceStore';
import { useVehicleInstanceStore } from '../store/vehicleInstanceStore';
import { usePlayersStore } from '../store/playersStore';
import { useSocketStore } from '../store/socket';
import { initPlaceInstanceSocketListeners } from '../store/placeInstanceStore';
import { initVehicleSocketListeners } from '../store/vehicleInstanceStore';
import { useGameSocket } from '../hooks/useGameSocket';
import type { PlaceDto } from '../types/place';
import type { PlaceInstanceDto } from '../types/placeInstance';
import type { VehicleInstanceDto } from '../types/vehicleInstance';
import { useGame } from '~/hooks/useGame';

export default function Game() {
  const navigate = useNavigate();
  const { authToken, currentPlayer } = useAuthStore();
  const playerId = currentPlayer?.id;
  const { placeInstancesByPlayer } = usePlaceInstanceStore();
  const { vehicleInstancesByPlayer } = useVehicleInstanceStore();
  const { mapViewData } = usePlayersStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<{ lat: number; lng: number } | null>(null);

  // Modal states
  const [buyPlaceModal, setBuyPlaceModal] = useState<(PlaceDto & { priceGold: number; priceGems: number }) | null>(null);
  const [jobBoard, setJobBoard] = useState<PlaceInstanceDto | null>(null);
  const [vehiclePanel, setVehiclePanel] = useState<VehicleInstanceDto | null>(null);

  // Dispatch route picker state - lifted from VehicleDispatchPanel
  const [isRoutePickerActive, setIsRoutePickerActive] = useState(false);
  const [route, setRoute] = useState<string[]>([]);

  // Get the starting place for the route (vehicle's current location)
  const startingPlaceId = vehiclePanel?.currentPlaceInstanceId;

  // Handle adding a place to the route from map click
  const handlePlaceInRoute = (placeInstanceId: string) => {
    if (route[route.length - 1] === placeInstanceId) return;
    if (route.length > 0 && !reachableNextPlaceInstanceIds.has(placeInstanceId)) return;
    setRoute([...route, placeInstanceId]);
  };

  // Handle starting route from VehicleDispatchPanel
  const handleStartRoute = () => {
    if (startingPlaceId) {
      setRoute([startingPlaceId]);
      setIsRoutePickerActive(true);
    }
  };

  // Handle clearing/canceling route
  const handleClearRoute = () => {
    setRoute([]);
    setIsRoutePickerActive(false);
  };

  // Resolve playerId - use param or fallback to currentPlayer
  const resolvedPlayerId = playerId || currentPlayer?.id;

  // Initialize real-time socket connection
  useGameSocket(currentPlayer?.gameId || '', resolvedPlayerId || '');

  const { getReachableNextPlaceInstanceIds } = useGame();

  // Fetch map view and player data
  const fetchData = useCallback(async () => {
    if (!resolvedPlayerId) return;

    try {
      // Fetch map view
      await usePlayersStore.getState().loadMapView(resolvedPlayerId);

      // Fetch place instances for sidebar (using getState to avoid dependency issues)
      await usePlaceInstanceStore.getState().loadPlaceInstancesByPlayerId(resolvedPlayerId);

      // Fetch vehicle instances for polling
      await useVehicleInstanceStore.getState().loadVehicleInstancesByPlayerId(resolvedPlayerId);

      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load game data');
      setLoading(false);
    }
  }, [resolvedPlayerId, authToken]);

  // Refresh the map view after a mutation. Calls `fetchMapView` (always
  // hits the network) rather than `loadMapView` (returns the cache).
  const fetchMapView = useCallback(async () => {
    if (!resolvedPlayerId) return;
    await usePlayersStore.getState().fetchMapView(resolvedPlayerId);
  }, [resolvedPlayerId]);

  useEffect(() => {
    if (!resolvedPlayerId) {
      navigate('/games');
      return;
    }

    // Initialize socket listeners for real-time updates
    initPlaceInstanceSocketListeners();
    initVehicleSocketListeners();

    // Request full sync from server
    const socket = useSocketStore.getState().socket;
    if (socket && currentPlayer?.gameId) {
      useSocketStore.getState().requestFullSync(currentPlayer.gameId, resolvedPlayerId);
    }

    fetchData();
  }, [resolvedPlayerId, fetchData, navigate, currentPlayer?.gameId]);

  // Handle place selection from sidebar
  const handlePlaceSelect = (placeInstance: PlaceInstanceDto) => {
    if (placeInstance.place) {
      setSelectedPlace({ lat: placeInstance.place.lat, lng: placeInstance.place.lng });
    }
  };

  // Handle clicking a place marker on the map
  const handlePlaceClick = (place: PlaceDto & { priceGold?: number; priceGems?: number }, isOwned: boolean) => {
    if (isOwned) {
      // Find the place instance and show job board
      const ownedPlaceInstance = mapViewData?.owned.find(pi => pi.placeId === place.id);
      if (ownedPlaceInstance) {
        setJobBoard(ownedPlaceInstance);
      }
    } else {
      // Show buy place modal - ensure we have the price info
      const placeWithPrice = {
        ...place,
        priceGold: place.priceGold ?? 1000,
        priceGems: place.priceGems ?? 0,
      };
      setBuyPlaceModal(placeWithPrice);
    }
  };

  // Handle vehicle click from sidebar
  const handleVehicleClick = (vehicle: VehicleInstanceDto) => {
    setVehiclePanel(vehicle);
  };

  // Handle purchase completion - refresh data
  const handlePurchaseComplete = () => {
    setBuyPlaceModal(null);
    // We can't go through fetchData (which calls the cached loadMapView),
    // because the cache would skip the network and the newly-bought place
    // would never appear on the map.
    fetchMapView();
    fetchData();
  };

  // Handle job acceptance - refresh data
  const handleJobAccept = () => {
    setJobBoard(null);
    fetchData();
  };

  // Handle dispatch completion - refresh data
  const handleDispatchComplete = () => {
    setVehiclePanel(null);
    setRoute([]);
    setIsRoutePickerActive(false);
    fetchData();
  };

  const ownedPlaceInstances = resolvedPlayerId ? placeInstancesByPlayer[resolvedPlayerId] || [] : [];
  const ownedVehicleInstances = resolvedPlayerId ? vehicleInstancesByPlayer[resolvedPlayerId] || [] : [];

  // Compute the set of owned place instance IDs that are valid next stops
  // in the current route. A place is reachable if there is any connection
  // (in either direction) from the last stop's template place, and the
  // place is not already in the route.
  let reachableNextPlaceInstanceIds: Set<string> = new Set<string>();
  useEffect(() => {
    reachableNextPlaceInstanceIds = getReachableNextPlaceInstanceIds(isRoutePickerActive, route);
  }, [isRoutePickerActive, route, ownedPlaceInstances, mapViewData]);

  if (loading) {
    return (
      <Layout title="Game">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading game...</div>
        </div>
      </Layout>
    );
  }

  if (error && !mapViewData) {
    return (
      <Layout title="Game">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-600">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Your Empire">
      <div className="flex flex-col h-full">
        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar */}
          <div className="w-100 bg-white border-r overflow-y-auto">
            {currentPlayer && (
              <GameControlPanel
                player={currentPlayer}
                placeInstances={ownedPlaceInstances}
                vehicleInstances={ownedVehicleInstances}
                onPlaceSelect={handlePlaceSelect}
                onVehicleClick={handleVehicleClick}
              />
            )}
          </div>

          {/* Map area */}
          <div className="flex-1 relative z-0">
            {mapViewData && (
              <PlayerMapView
                mapViewData={mapViewData}
                selectedPlace={selectedPlace}
                onPlaceClick={handlePlaceClick}
                dispatchMode={isRoutePickerActive}
                onDispatchPlaceClick={handlePlaceInRoute}
                route={isRoutePickerActive ? route : []}
                reachableNextPlaceInstanceIds={reachableNextPlaceInstanceIds}
              />
            )}

            {/* Buy Place Modal */}
            {buyPlaceModal && (
              <BuyPlaceModal
                place={buyPlaceModal}
                onPurchaseComplete={handlePurchaseComplete}
                onCancel={() => setBuyPlaceModal(null)}
              />
            )}

            {/* Job Board Modal */}
            {jobBoard && !isRoutePickerActive && (
              <JobBoard
                placeInstance={jobBoard}
                onAcceptJob={handleJobAccept}
                onClose={() => setJobBoard(null)}
              />
            )}

            {/* Vehicle Dispatch Panel */}
            {vehiclePanel && (
              <VehicleDispatchPanel
                vehicle={vehiclePanel}
                ownedPlaceInstances={ownedPlaceInstances}
                onDispatchComplete={handleDispatchComplete}
                onClose={() => setVehiclePanel(null)}
                route={route}
                isRoutePickerActive={isRoutePickerActive}
                onStartRoute={handleStartRoute}
                onPlaceInRoute={handlePlaceInRoute}
                onRemoveLastStop={() => route.length > 1 && setRoute(route.slice(0, -1))}
                onClearRoute={handleClearRoute}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
