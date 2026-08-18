import { useAuth } from '../lib/AuthContext';
import { useCallback } from 'react';

export const useApi = () => {
  const { getToken } = useAuth();

  const fetchApi = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = await getToken();
    const headers = new Headers(options.headers || {});
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Error ${res.status}: ${res.statusText}`);
    }

    return res.json();
  }, [getToken]);

  return { fetchApi };
};
