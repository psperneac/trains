import type { ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';
import Navigation from './Navigation';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const setAuthToken = useAuthStore((state) => state.setAuthToken);

  const handleLogout = () => {
    setAuthToken(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
            <h1 className="text-xl font-semibold text-gray-900">Train Management</h1>
            <button
              onClick={handleLogout}
              className="px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {title && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
} 