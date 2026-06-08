import type { PlaceInstanceDto } from '../types/placeInstance';
import type { VehicleInstanceDto } from '../types/vehicleInstance';
import type { PlayerDto } from '~/types/player';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs';
import WalletDisplay from './WalletDisplay';

interface GameControlPanelProps {
  player: PlayerDto;
  placeInstances: PlaceInstanceDto[];
  vehicleInstances: VehicleInstanceDto[];
  onPlaceSelect: (placeInstance: PlaceInstanceDto) => void;
  onVehicleClick: (vehicle: VehicleInstanceDto) => void;
}

export default function GameControlPanel({
  player,
  placeInstances,
  vehicleInstances,
  onPlaceSelect,
  onVehicleClick,
}: GameControlPanelProps) {
  // Group vehicles by their current place
  const vehiclesAtPlace = vehicleInstances.filter(v => v.status === 'AT_PLACE' && v.currentPlaceInstanceId);
  const vehiclesInTransit = vehicleInstances.filter(v => v.status === 'IN_TRANSIT');

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="places" className="flex flex-col flex-1">
        <TabsList className="w-full">
          <TabsTrigger value="player">
            Player
          </TabsTrigger>
          <TabsTrigger value="places">
            Places ({placeInstances.length})
          </TabsTrigger>
          <TabsTrigger value="vehicles">
            Vehicles ({vehicleInstances.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="player" className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {player?.wallet && <WalletDisplay wallet={player.wallet} />}
          </div>
        </TabsContent>

        <TabsContent value="places" className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {placeInstances.length === 0 ? (
              <p className="text-sm text-gray-500 p-2">No places owned yet.</p>
            ) : (
              placeInstances.map(pi => (
                <button
                  key={pi.id}
                  onClick={() => onPlaceSelect(pi)}
                  className="w-full text-left p-2 rounded hover:bg-gray-100 transition-colors"
                >
                  <div className="font-medium text-sm text-gray-900">
                    {pi.place?.name || 'Unknown Place'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {pi.place?.type || 'Unknown type'}
                  </div>
                  {pi.jobOffers && pi.jobOffers.length > 0 && (
                    <div className="mt-1 text-xs text-green-600 font-medium">
                      {pi.jobOffers.length} job{pi.jobOffers.length !== 1 ? 's' : ''} available
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {/* Vehicles at places */}
            <div className="text-xs text-gray-500 uppercase font-medium px-2 py-1">
              At Places
            </div>
            {vehiclesAtPlace.length === 0 ? (
              <p className="text-sm text-gray-500 p-2">No vehicles at places.</p>
            ) : (
              vehiclesAtPlace.map(v => (
                <button
                  key={v.id}
                  onClick={() => onVehicleClick(v)}
                  className="w-full text-left p-2 rounded hover:bg-gray-100 transition-colors"
                >
                  <div className="font-medium text-sm text-gray-900">
                    {v.vehicle?.name || 'Unknown Vehicle'}
                  </div>
                  <div className="text-xs text-gray-500">
                    at {v.currentPlaceInstance?.place?.name || 'Unknown place'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Status: {v.status}
                  </div>
                </button>
              ))
            )}

            {/* Vehicles in transit */}
            <div className="text-xs text-gray-500 uppercase font-medium px-2 py-1 mt-3">
              In Transit
            </div>
            {vehiclesInTransit.length === 0 ? (
              <p className="text-sm text-gray-500 p-2">No vehicles in transit.</p>
            ) : (
              vehiclesInTransit.map(v => (
                <button
                  key={v.id}
                  onClick={() => onVehicleClick(v)}
                  className="w-full text-left p-2 rounded hover:bg-gray-100 transition-colors"
                >
                  <div className="font-medium text-sm text-gray-900">
                    {v.vehicle?.name || 'Unknown Vehicle'}
                  </div>
                  <div className="text-xs text-gray-500">
                    → {v.destinationPlaceInstance?.place?.name || 'En route'}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {v.route?.length || 0} stops planned
                  </div>
                </button>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}