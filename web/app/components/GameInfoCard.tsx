import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { GameDto } from '../types/game';

interface GameInfoCardProps {
  game: GameDto | null;
}

export default function GameInfoCard({ game }: GameInfoCardProps) {
  const { currentPlayer, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  if (!game) {
    return (
      <div className="bg-gray-50 p-4 rounded-md">
        {isAdmin() ? (
          <p className="text-sm text-gray-600">
            Please select a game to see game details.
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            Select a game to view details and play.
          </p>
        )}
      </div>
    );
  }

  const handlePlayGame = () => {
    // Navigate to the games page to play the selected game
    navigate('/games');
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <h3 className="font-medium text-gray-900 mb-2">{game.name}</h3>
      <p className="text-sm text-gray-600 mb-3">{game.description}</p>

      {currentPlayer && (
        <div className="mb-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
          <p className="text-sm font-medium text-blue-900">Your Player:</p>
          <p className="text-sm text-blue-700">{currentPlayer.name}</p>
          {currentPlayer.description && (
            <p className="text-xs text-blue-600 mt-1">{currentPlayer.description}</p>
          )}
        </div>
      )}

      <button
        onClick={handlePlayGame}
        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
      >
        Play {game.name}
      </button>
    </div>
  );
}
