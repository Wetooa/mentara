import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api';

/**
 * Hook to set up API authentication with Clerk token
 * This should be called once at the app level to configure the API client
 */
export function useApiAuth() {
  const { getToken } = useAuth();

  useEffect(() => {
    // Set up the token provider for the API client
    api.setAuthToken(async () => {
      try {
        return await getToken();
      } catch (error) {
        console.error('Failed to get auth token:', error);
        return null;
      }
    });
  }, [getToken]);
}

export default useApiAuth;