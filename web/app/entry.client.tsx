import { createRoot } from 'react-dom/client';
import Root from './App';
import { useAuthStore } from './store/authStore';

useAuthStore.getState().initializeAuth();

const root = createRoot(document.getElementById('root')!);
root.render(<Root />); 