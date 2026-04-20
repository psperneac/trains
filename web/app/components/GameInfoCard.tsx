import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { GameDto } from '../types/game';

interface GameInfoCardProps {
  game: GameDto | null;
}

export default function GameInfoCard({ game }: GameInfoCardProps) {
  const { currentPlayer, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  if (!game) {
    return (
      <div className="bg-gray-50 p-4 rounded-md">
        {isAdmin() ? (
          <p className="text-sm text-gray-600">
            {t('gameInfoCard.pleaseSelectGame')}
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            {t('gameInfoCard.selectGame')}
          </p>
        )}
      </div>
    );
  }

  const handlePlayGame = () => {
    // Navigate to the game page if player exists, otherwise to games page
    if (currentPlayer) {
      navigate(`/game/${currentPlayer.id}`);
    } else {
      navigate('/games');
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <h3 className="font-medium text-gray-900 mb-2">{game.name}</h3>
      <p className="text-sm text-gray-600 mb-3">{game.description}</p>

      {currentPlayer && (
        <div className="mb-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
          <p className="text-sm font-medium text-blue-900">{t('gameInfoCard.yourPlayer')}:</p>
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
        {t('gameInfoCard.play')} {game.name}
      </button>
    </div>
  );
}
