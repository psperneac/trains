import { useAuthStore } from '../store/authStore';

export default function StatusComponent() {
  const { currentGame, currentPlayer } = useAuthStore();

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-t border-b border-blue-200 dark:border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-4">
            {currentGame ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Current Game:
                </span>
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  {currentGame.name}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                  {currentGame.type}
                </span>
              </div>
            ) : (
              <span className="text-sm text-blue-600 dark:text-blue-400">
                No game selected
              </span>
            )}
          </div>

          {currentPlayer && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Player:
              </span>
              <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                {currentPlayer.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}