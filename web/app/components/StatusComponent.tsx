import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';

export interface OptionsMenuItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface StatusComponentProps {
  options?: OptionsMenuItem[];
}

export default function StatusComponent({ options = [] }: StatusComponentProps) {
  const { currentGame, currentPlayer } = useAuthStore();
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-t border-b border-blue-200 dark:border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-4">
            {currentGame ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {t('status.currentGame')}:
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
                {t('status.noGameSelected')}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {currentPlayer && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {t('status.player')}:
                </span>
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  {currentPlayer.name}
                </span>
              </div>
            )}

            {options.length > 0 && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="px-3 py-1 text-sm font-medium text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-800 rounded hover:bg-blue-200 dark:hover:bg-blue-700"
                >
                  Options ▾
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50">
                    {options.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          item.onClick();
                          setShowMenu(false);
                        }}
                        disabled={item.disabled}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          item.disabled
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}