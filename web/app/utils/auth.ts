import { useAuthStore } from '../store/authStore';

export const handleAuthError = () => {
  // Clear authentication state
  useAuthStore.getState().setAuthToken(null);

  // Redirect to login page
  window.location.href = '/login';
};
