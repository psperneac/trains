import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import WalletDisplay from '../components/WalletDisplay';
import OwnedPlacesList from '../components/OwnedPlacesList';
import PlayerMapView from '../components/PlayerMapView';
import BuyPlaceModal from '../components/BuyPlaceModal';
import JobBoard from '../components/JobBoard';
import VehicleDispatchPanel from '../components/VehicleDispatchPanel';
import { useAuthStore } from '../store/authStore';
import { usePlaceInstanceStore } from '../store/placeInstanceStore';
import { useVehicleInstanceStore } from '../store/vehicleInstanceStore';
import { apiRequest } from '../config/api';
import type { PlaceDto } from '../types/place';
import type { PlaceInstanceDto } from '../types/placeInstance';
import type { VehicleInstanceDto } from '../types/vehicleInstance';

interface MapViewData {
  owned: PlaceInstanceDto[];
  available: (PlaceDto & { priceGold: number; priceGems: number })[];
  connections: any[];
}

export default function Game() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const { authToken, currentPlayer, setCurrentPlayer } = useAuthStore();
  const { fetchPlaceInstancesByPlayerId, placeInstancesByPlayer } = usePlaceInstanceStore();
  const { fetchVehicleInstancesByPlayerId, vehicleInstancesByPlayer } = useVehicleInstanceStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapViewData, setMapViewData] = useState<MapViewData | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<{ lat: number; lng: number } | null>(null);

  // Modal states
  const [buyPlaceModal, setBuyPlaceModal] = useState<(PlaceDto & { priceGold: number; priceGems: number }) | null>(null);
  const [jobBoard, setJobBoard] = useState<PlaceInstanceDto | null>(null);
  const [vehiclePanel, setVehiclePanel] = useState<VehicleInstanceDto | null>(null);

  // Resolve playerId - use param or fallback to currentPlayer
  const resolvedPlayerId = playerId || currentPlayer?.id;

  // Fetch map view and player data
  const fetchData = useCallback(async () => {
    if (!resolvedPlayerId) return;

    try {
      const token = typeof authToken === 'string' ? authToken : undefined;

      // Fetch map view
      const mapView = await apiRequest<MapViewData>(
        `/api/players/${resolvedPlayerId}/map-view`,
        { method: 'GET', authToken: token }
      );
      console.log('[Game] map-view response:', mapView);
      setMapViewData(mapView);

      // Fetch place instances for sidebar (using getState to avoid dependency issues)
      usePlaceInstanceStore.getState().fetchPlaceInstancesByPlayerId(resolvedPlayerId);

      // Fetch vehicle instances for polling
      useVehicleInstanceStore.getState().fetchVehicleInstancesByPlayerId(resolvedPlayerId);

      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load game data');
      setLoading(false);
    }
  }, [resolvedPlayerId, authToken]);

  useEffect(() => {
    if (!resolvedPlayerId) {
      navigate('/games');
      return;
    }

    fetchData();

    // 2-second polling for vehicle positions
    const pollInterval = setInterval(() => {
      useVehicleInstanceStore.getState().fetchVehicleInstancesByPlayerId(resolvedPlayerId);
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [resolvedPlayerId, fetchData, navigate]);

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
    fetchData();
  };

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

  const ownedPlaceInstances = resolvedPlayerId ? placeInstancesByPlayer[resolvedPlayerId] || [] : [];
  const vehicleInstances = resolvedPlayerId ? vehicleInstancesByPlayer[resolvedPlayerId] || [] : [];

  return (
    <Layout title="Game">
      <div className="flex flex-col h-full">
        {/* Top bar with wallet */}
        <div className="bg-white border-b p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Your Railway Empire</h1>
          {currentPlayer?.wallet && <WalletDisplay wallet={currentPlayer.wallet} />}
        </div>

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-white border-r overflow-y-auto">
            <OwnedPlacesList
              placeInstances={ownedPlaceInstances}
              vehicleInstances={vehicleInstances}
              onPlaceSelect={handlePlaceSelect}
              onVehicleClick={handleVehicleClick}
            />
          </div>

          {/* Map area */}
          <div className="flex-1 relative z-0">
            {mapViewData && (
              <PlayerMapView
                ownedPlaces={mapViewData.owned.map(pi => ({
                  ...pi.place!,
                  isOwned: true,
                  placeInstanceId: pi.id,
                }))}
                availablePlaces={mapViewData.available.map(p => ({
                  ...p,
                  isOwned: false,
                }))}
                connections={mapViewData.connections}
                selectedPlace={selectedPlace}
                onPlaceClick={handlePlaceClick}
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
            {jobBoard && (
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
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}