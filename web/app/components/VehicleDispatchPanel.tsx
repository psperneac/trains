import { useState } from 'react';
import type { VehicleInstanceDto } from '../types/vehicleInstance';
import type { PlaceInstanceDto } from '../types/placeInstance';
import { useAuthStore } from '../store/authStore';
import { apiRequest } from '../config/api';
import Toast from './Toast';
import RoutePickerOverlay from './RoutePickerOverlay';

interface VehicleDispatchPanelProps {
  vehicle: VehicleInstanceDto;
  ownedPlaceInstances: PlaceInstanceDto[];
  onDispatchComplete: () => void;
  onClose: () => void;
}

export default function VehicleDispatchPanel({
  vehicle,
  ownedPlaceInstances,
  onDispatchComplete,
  onClose,
}: VehicleDispatchPanelProps) {
  const { authToken, currentPlayer } = useAuthStore();
  const [route, setRoute] = useState<string[]>([]);
  const [dispatching, setDispatching] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [isRoutePickerActive, setIsRoutePickerActive] = useState(false);

  // Get the starting place for the route (vehicle's current location)
  const startingPlaceId = vehicle.currentPlaceInstanceId;

  // Get all places that can be used as waypoints (owned places)
  const availableWaypoints = ownedPlaceInstances.filter(pi => pi.id !== startingPlaceId);

  const handleStartRoute = () => {
    // Initialize route with vehicle's current location as first stop
    setRoute([startingPlaceId]);
    setIsRoutePickerActive(true);
  };

  const handlePlaceInRoute = (placeInstanceId: string) => {
    // Add place to route if it's not already the last stop
    if (route[route.length - 1] !== placeInstanceId) {
      setRoute([...route, placeInstanceId]);
    }
  };

  const handleRemoveLastStop = () => {
    if (route.length > 1) {
      setRoute(route.slice(0, -1));
    }
  };

  const handleClearRoute = () => {
    setRoute([]);
    setIsRoutePickerActive(false);
  };

  const handleConfirmRoute = () => {
    // Finalize route selection
    setIsRoutePickerActive(false);
  };

  const handleDispatch = async () => {
    if (!currentPlayer || route.length < 2) return;

    setDispatching(true);
    setError('');

    try {
      const token = typeof authToken === 'string' ? authToken : undefined;
      const result = await apiRequest<{ success: boolean; error?: string; travelTimeMs?: number }>(
        `/api/vehicles/${vehicle.id}/dispatch`,
        {
          method: 'POST',
          authToken: token,
          body: JSON.stringify({ route }),
        }
      );

      if (result.success) {
        const minutes = Math.round((result.travelTimeMs || 0) / 60000);
        setToastMessage(`Vehicle dispatched! Arrival in ~${minutes} minutes.`);
        setToastType('success');
        setShowToast(true);
        setTimeout(() => {
          onDispatchComplete();
        }, 1500);
      } else {
        setError(result.error || 'Failed to dispatch vehicle');
        setToastMessage(result.error || 'Failed to dispatch vehicle');
        setToastType('error');
        setShowToast(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch vehicle');
      setToastMessage(err.message || 'Failed to dispatch vehicle');
      setToastType('error');
      setShowToast(true);
    } finally {
      setDispatching(false);
    }
  };

  // Get display names for route stops
  const getRouteDisplay = () => {
    return route.map(placeId => {
      const pi = ownedPlaceInstances.find(p => p.id === placeId);
      return pi?.place?.name || 'Unknown';
    });
  };

  // Only allow dispatch if route has 2+ stops
  const canDispatch = route.length >= 2;

  return (
    <>
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-xl w-80 z-50 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-bold">Dispatch Vehicle</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
        </div>

        {/* Vehicle info */}
        <div className="p-4 border-b bg-gray-50">
          <div className="font-semibold">{vehicle.vehicle?.name || 'Vehicle'}</div>
          <div className="text-sm text-gray-500">
            at {vehicle.currentPlaceInstance?.place?.name || 'Unknown place'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Status: {vehicle.status}
          </div>
        </div>

        {/* Route builder */}
        <div className="p-4 flex-1 overflow-y-auto">
          {!isRoutePickerActive ? (
            <>
              {/* Route display */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Route ({route.length} stops)
                </label>
                <div className="bg-gray-50 rounded p-2 min-h-[60px]">
                  {route.length === 0 ? (
                    <p className="text-sm text-gray-400">No route selected</p>
                  ) : (
                    <div className="space-y-1">
                      {getRouteDisplay().map((name, idx) => (
                        <div key={idx} className="text-sm flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                            idx === 0 ? 'bg-green-500 text-white' :
                            idx === route.length - 1 ? 'bg-red-500 text-white' :
                            'bg-gray-300 text-gray-700'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className={idx === 0 ? 'font-medium' : ''}>{name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={handleStartRoute}
                  disabled={route.length > 0}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 text-sm"
                >
                  {route.length > 0 ? 'Route Started' : 'Build Route'}
                </button>
                {route.length > 1 && (
                  <button
                    onClick={handleRemoveLastStop}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                  >
                    Remove Last Stop
                  </button>
                )}
                {route.length > 0 && (
                  <button
                    onClick={handleClearRoute}
                    className="w-full px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                  >
                    Clear Route
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 p-3 bg-blue-50 rounded">
                <p className="text-sm text-blue-700">
                  Click on the map to add stops to your route.
                  Start with your vehicle's location.
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Route ({route.length} stops)
                </label>
                <div className="bg-gray-50 rounded p-2 min-h-[60px]">
                  {getRouteDisplay().map((name, idx) => (
                    <div key={idx} className="text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleConfirmRoute}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                >
                  Confirm Route
                </button>
                <button
                  onClick={handleClearRoute}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer - dispatch button */}
        <div className="p-4 border-t">
          <button
            onClick={handleDispatch}
            disabled={!canDispatch || dispatching}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {dispatching ? 'Dispatching...' : canDispatch ? 'Dispatch Vehicle' : 'Add 2+ stops to dispatch'}
          </button>
        </div>
      </div>

      {/* Route picker overlay - shown when in route picker mode */}
      {isRoutePickerActive && (
        <RoutePickerOverlay
          ownedPlaceInstances={availableWaypoints}
          route={route}
          onPlaceClick={handlePlaceInRoute}
          currentLocationId={startingPlaceId}
        />
      )}

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}