import { useAuth } from "@clerk/nextjs";
import { createApiClientWithAuth, apiClient } from './client';
import { createApiServices, ApiServices } from './services';

// Hook to use the API client in React components
export const useApi = (): ApiServices => {
  const { getToken } = useAuth();
  
  // Create axios client with auth
  const client = createApiClientWithAuth(() => getToken());
  
  // Return all services
  return createApiServices(client);
};

// For use outside of React components (server-side, utilities, etc.)
export const createStandaloneApiClient = (
  getTokenFn: () => Promise<string | null>
): ApiServices => {
  const client = createApiClientWithAuth(getTokenFn);
  return createApiServices(client);
};

// Default API client without authentication (for public endpoints)
export const publicApi = createApiServices(apiClient);

// Export types for TypeScript support
export type { ApiServices };
export * from './services';