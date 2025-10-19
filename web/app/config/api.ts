
import { handleAuthError } from '../utils/auth';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiRequestOptions extends RequestInit {
  method: HttpMethod;
  authToken?: string;
}

export const getApiServer = () => {
  const apiServer = import.meta.env.VITE_API_SERVER;
  if (!apiServer) {
    throw new Error('API server URL is not configured');
  }
  return apiServer;
};

export const getApiUrl = (path: string) => {
  return `${getApiServer()}${path}`;
};

export const apiRequest = async <T>(path: string, options: ApiRequestOptions): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (options.authToken) {
    headers['Authorization'] = `Bearer ${options.authToken}`;
  }
  const response = await fetch(getApiUrl(path), {
    ...options,
    headers,
  });

  if (response.status === 401) {
    handleAuthError();
    throw new Error('Authentication required');
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}; 