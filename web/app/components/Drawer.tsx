import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DrawerProps {
  side?: 'left' | 'right' | 'bottom';
  title?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  defaultPinned?: boolean;
}

const Drawer: React.FC<DrawerProps> = ({
  side = 'right',
  title,
  children,
  defaultOpen = false,
  defaultPinned = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isPinned, setIsPinned] = useState(defaultPinned);
  const drawerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Auto-open if pinned
  useEffect(() => {
    if (isPinned) {
      setIsOpen(true);
    }
  }, [isPinned]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen && 
        !isPinned && 
        drawerRef.current && 
        !drawerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isPinned]);

  const toggleOpen = () => {
    if (!isPinned) {
      setIsOpen(!isOpen);
    }
  };

  const togglePinned = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPinned(!isPinned);
  };

  const getPositionClasses = () => {
    switch (side) {
      case 'left':
        return `left-0 top-0 h-full border-r ${isOpen ? 'translate-x-0' : '-translate-x-full'}`;
      case 'bottom':
        return `bottom-0 left-0 w-full border-t ${isOpen ? 'translate-y-0' : 'translate-y-full'}`;
      case 'right':
      default:
        return `right-0 top-0 h-full border-l ${isOpen ? 'translate-x-0' : 'translate-x-full'}`;
    }
  };

  const getTabClasses = () => {
    const common = "absolute cursor-pointer flex items-center justify-center bg-white shadow-md border hover:bg-gray-50 transition-all duration-300 z-10";
    switch (side) {
      case 'left':
        return `${common} left-full top-1/2 -translate-y-1/2 w-8 h-24 rounded-r-xl border-l-0`;
      case 'bottom':
        return `${common} bottom-full left-1/2 -translate-x-1/2 w-24 h-8 rounded-t-xl border-b-0`;
      case 'right':
      default:
        return `${common} right-full top-1/2 -translate-y-1/2 w-8 h-24 rounded-l-xl border-r-0`;
    }
  };

  const getDrawerClasses = () => {
    const common = "fixed bg-white/90 backdrop-blur-md shadow-2xl transition-transform duration-300 ease-in-out z-[9999] overflow-visible";
    const size = side === 'bottom' ? 'h-64' : 'w-80';
    return `${common} ${getPositionClasses()} ${size}`;
  };

  return (
    <div ref={drawerRef} className={getDrawerClasses()}>
      {/* Folder Tab Handle */}
      {!isPinned && (
        <div className={getTabClasses()} onClick={toggleOpen}>
          <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            {side === 'right' ? '‹' : side === 'left' ? '›' : '︿'}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="h-full flex flex-col p-4">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="font-bold text-gray-800 text-lg">{title || t('drawer.options')}</h3>
          <div className="flex gap-2">
            <button 
              onClick={togglePinned}
              className={`p-1.5 rounded-full transition-colors ${isPinned ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100 text-gray-400'}`}
              title={isPinned ? t('drawer.unpin') : t('drawer.pin')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={isPinned ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            {!isPinned && (
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Drawer;
