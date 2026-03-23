import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';

interface CopyPlaceConnectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopy: (sourceGameId: string, overwrite: boolean) => Promise<void>;
}

export default function CopyPlaceConnectionsModal({ isOpen, onClose, onCopy }: CopyPlaceConnectionsModalProps) {
  const { allGames, fetchAllGames } = useGameStore();
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [overwrite, setOverwrite] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAllGames();
      setSelectedGameId('');
      setOverwrite(false);
    }
  }, [isOpen, fetchAllGames]);

  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (!selectedGameId) return;
    setIsCopying(true);
    try {
      await onCopy(selectedGameId, overwrite);
      onClose();
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 overflow-y-auto h-full w-full z-[9999]"
      onClick={onClose}
    >
      <div
        className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mt-3 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Copy Place Connections
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Select a source game to copy all its place connections to the current game.
            Connections are matched by their start and end places. Connections referencing
            places that don't exist in the target game will be skipped.
          </p>
          <select
            value={selectedGameId}
            onChange={(e) => setSelectedGameId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 text-sm"
          >
            <option value="">Select a game...</option>
            {allGames.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name} {game.type === 'TEMPLATE' ? '(Template)' : ''}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 mb-4">
            <input
              type="checkbox"
              id="overwrite"
              checked={overwrite}
              onChange={(e) => setOverwrite(e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="overwrite" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
              Overwrite existing connections with same route
            </label>
          </div>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleCopy}
              disabled={!selectedGameId || isCopying}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded"
            >
              {isCopying ? 'Copying...' : 'Copy'}
            </button>
            <button
              ref={cancelButtonRef}
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}