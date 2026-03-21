import { useEffect, useRef } from 'react';

interface DeleteConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message: string;
}

export default function DeleteConfirmation({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Confirm Delete',
  message,
}: DeleteConfirmationProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 overflow-y-auto h-full w-full z-[9999]"
      onClick={onCancel}
    >
      <div 
        className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mt-3 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {title}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {message}
          </p>
          <div className="flex justify-center space-x-4">
            <button
              ref={confirmButtonRef}
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Delete
            </button>
            <button
              onClick={onCancel}
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