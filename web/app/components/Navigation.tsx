import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface MenuItem {
  label?: string;
  path?: string;
  children?: MenuItem[];
  action?: () => void;
  separator?: boolean;
}

export default function Navigation() {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const location = useLocation();
  const submenuRef = useRef<HTMLDivElement>(null);
  const { currentGameId, setAuthToken } = useAuthStore();

  const menuItems: MenuItem[] = [
    {
      label: 'Home',
      path: '/',
    },
    {
      label: 'Admin',
      children: [
        {
          label: 'Place Types',
          path: '/admin/place-types',
        },
        {
          label: 'Vehicle Types',
          path: '/admin/vehicle-types',
        },
        {
          label: 'Places',
          path: '/admin/places',
        },
        {
          label: 'Place Connections',
          path: '/admin/place-connections',
        },
        {
          label: 'Games',
          path: '/admin/games',
        },
      ],
    },
    {
      label: 'Settings',
      children: [
        {
          label: 'Change Password',
          path: '/settings/change-password',
        },
        {
          separator: true,
        },
        {
          label: 'Logout',
          action: () => setAuthToken(null),
        },
      ],
    },
  ];

  useEffect(() => {
    if (!openSubmenu) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        submenuRef.current &&
        !submenuRef.current.contains(event.target as Node)
      ) {
        setOpenSubmenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openSubmenu]);

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  const renderMenuItem = (item: MenuItem) => {
    if (item.children) {
      return (
        <div key={item.label} className="relative" ref={openSubmenu === item.label ? submenuRef : undefined}>
          <button
            onClick={() => toggleSubmenu(item.label!)}
            className={`flex items-center px-3 py-1 text-sm font-medium rounded-md ${
              openSubmenu === item.label
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {item.label}
            <svg
              className={`ml-2 h-4 w-4 transform ${
                openSubmenu === item.label ? 'rotate-180' : ''
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {openSubmenu === item.label && (
            <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-1" role="menu">
                {item.children?.map((child, index) => {
                  if (child.separator) {
                    return <div key={`separator-${index}`} className="border-t border-gray-200 my-1" />;
                  }

                  const isDisabled = child.label === 'Place Connections' && !currentGameId;
                  if (isDisabled) {
                    return (
                      <div
                        key={child.path || child.label}
                        className="block px-4 py-1 text-sm text-gray-400 cursor-not-allowed"
                        role="menuitem"
                      >
                        {child.label}
                      </div>
                    );
                  }

                  if (child.action) {
                    return (
                      <button
                        key={child.label}
                        onClick={child.action}
                        className="block w-full text-left px-4 py-1 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        role="menuitem"
                      >
                        {child.label}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={child.path}
                      to={child.path!}
                      className={`block px-4 py-1 text-sm ${
                        location.pathname === child.path
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      role="menuitem"
                    >
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path!}
        className={`block px-3 py-1 text-sm font-medium rounded-md ${
          location.pathname === item.path
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <nav className="bg-white shadow-sm py-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <div className="flex space-x-2">
            {menuItems.slice(0, -1).map(renderMenuItem)}
          </div>
          <div className="ml-auto">
            {renderMenuItem(menuItems[menuItems.length - 1])}
          </div>
        </div>
      </div>
    </nav>
  );
} 