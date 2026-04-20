import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';
import { usePlayersStore } from '../store/playersStore';
import { usePlaceStore } from '../store/placeStore';
import type { PlaceDto } from '../types/place';
import { apiRequest } from '../config/api';

export default function SelectStartingPlace() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const { authToken, userId } = useAuthStore();
  const { players, fetchPlayersByUserId } = usePlayersStore();
  const { allPlaces, fetchPlacesByGameId } = usePlaceStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selecting, setSelecting] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);

  const player = players.find(p => p.id === playerId);

  useEffect(() => {
    if (!playerId) {
      setError('Invalid player ID');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        // Fetch player to get their game
        await fetchPlayersByUserId(userId || '');

        // Get the player's game ID and fetch places
        if (player) {
          await fetchPlacesByGameId(player.gameId);
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        setLoading(false);
      }
    };

    loadData();
  }, [playerId, userId, fetchPlayersByUserId, fetchPlacesByGameId]);

  const handleSelectPlace = async () => {
    if (!playerId || !selectedPlace) return;

    setSelecting(true);
    setError('');

    try {
      const rawToken = authToken;
      const token = typeof rawToken === 'string' ? rawToken : undefined;

      const result = await apiRequest<{ success: boolean; error?: string }>(
        `/api/player-init/${playerId}/select-starting-place`,
        {
          method: 'POST',
          authToken: token,
          body: JSON.stringify({ placeId: selectedPlace })
        }
      );

      if (result.success) {
        // Redirect to main game view
        navigate(`/game/${playerId}`);
      } else {
        setError(result.error || 'Failed to select starting place');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to select starting place');
    } finally {
      setSelecting(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Select Starting Place">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading places...</div>
        </div>
      </Layout>
    );
  }

  if (error && !player) {
    return (
      <Layout title="Select Starting Place">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-600">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Select Starting Place">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Select Your Starting Place</h1>
          <p className="mt-2 text-gray-600">
            Choose a place to start your railway empire. Each place has different connections and job opportunities.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {allPlaces.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <p className="text-gray-500">No places available in this game.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPlaces.map((place) => (
              <div
                key={place.id}
                onClick={() => setSelectedPlace(place.id)}
                className={`
                  bg-white shadow-md rounded-lg p-4 cursor-pointer transition-all
                  ${selectedPlace === place.id
                    ? 'ring-2 ring-blue-500 border-blue-500'
                    : 'hover:shadow-lg border-gray-200'
                  }
                `}
              >
                <h3 className="text-lg font-semibold text-gray-900">{place.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{place.description}</p>
                {place.type && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700">
                    {place.type}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedPlace && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
            <div className="container mx-auto flex justify-between items-center">
              <div className="text-gray-600">
                Selected: <span className="font-semibold">{allPlaces.find(p => p.id === selectedPlace)?.name}</span>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate('/games')}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSelectPlace}
                  disabled={selecting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
                >
                  {selecting ? 'Setting Up...' : 'Start Here'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
