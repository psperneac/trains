import { useState } from 'react';
import type { PlaceDto } from '../types/place';
import { useAuthStore } from '../store/authStore';
import { apiRequest } from '../config/api';
import Toast from './Toast';

interface BuyPlaceModalProps {
  place: PlaceDto & { priceGold: number; priceGems: number };
  onPurchaseComplete: () => void;
  onCancel: () => void;
}

export default function BuyPlaceModal({ place, onPurchaseComplete, onCancel }: BuyPlaceModalProps) {
  const { authToken, currentPlayer } = useAuthStore();
  const [description, setDescription] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const handlePurchase = async () => {
    if (!currentPlayer) return;

    setPurchasing(true);
    setError('');

    try {
      const token = typeof authToken === 'string' ? authToken : undefined;
      const result = await apiRequest<{ success: boolean; error?: string }>(
        `/api/players/${currentPlayer.id}/purchase-place`,
        {
          method: 'POST',
          authToken: token,
          body: JSON.stringify({ placeId: place.id, description }),
        }
      );

      if (result.success) {
        setToastMessage(`${place.name} purchased successfully!`);
        setToastType('success');
        setShowToast(true);
        setTimeout(() => {
          onPurchaseComplete();
        }, 1500);
      } else {
        setError(result.error || 'Failed to purchase place');
        setToastMessage(result.error || 'Failed to purchase place');
        setToastType('error');
        setShowToast(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to purchase place');
      setToastMessage(err.message || 'Failed to purchase place');
      setToastType('error');
      setShowToast(true);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <>
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Purchase Place</h2>

            {/* Place info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-lg">{place.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{place.description}</p>
              <div className="flex items-center gap-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  place.type === 'RAIL' ? 'bg-red-100 text-red-800' :
                  place.type === 'WAREHOUSE' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {place.type}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Price</p>
              <div className="flex items-center gap-4">
                <span className="text-amber-600 font-medium text-lg">
                  💰 {place.priceGold.toLocaleString()} gold
                </span>
                {place.priceGems > 0 && (
                  <span className="text-purple-600 font-medium text-lg">
                    💎 {place.priceGems} gems
                  </span>
                )}
              </div>
            </div>

            {/* Description field */}
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why are you buying this place?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onCancel}
                disabled={purchasing}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {purchasing ? 'Purchasing...' : 'Purchase'}
              </button>
            </div>
          </div>
        </div>
      </div>

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