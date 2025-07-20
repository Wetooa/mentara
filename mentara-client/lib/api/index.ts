// Main API entry point - provides the complete API object with all services
// Usage: import { api } from '@/lib/api'
// Then: api.auth.getCurrentUser(), api.client.getProfile(), etc.

import { useAuth } from '@/contexts/AuthContext';
import { createAxiosClient, setTokenProvider } from "./client";
import { createApiServices, type ApiServices } from "./services";

// Create the axios client
const axiosClient = createAxiosClient();

// Create all API services using the axios client
const apiServices = createApiServices(axiosClient);

// React hook for API access with authentication
export const useApi = () => {
  const { accessToken, refreshAccessToken } = useAuth();
  
  // Set up JWT token provider for this session
  const getToken = async (): Promise<string | null> => {
    if (!accessToken) return null;
    
    // Check if token is still valid (simple check)
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // If token expires in less than 5 minutes, try to refresh
      if (payload.exp && payload.exp - currentTime < 300) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) return null;
      }
      
      return accessToken;
    } catch (error) {
      console.error('Error checking token validity:', error);
      return accessToken; // Return current token if check fails
    }
  };
  
  setTokenProvider(getToken);
  
  return api;
};

// Create the main API object with additional utilities
export const api = {
  ...apiServices,

  // Utility methods
  setAuthToken: (tokenProvider: () => Promise<string | null>) => {
    setTokenProvider(tokenProvider);
  },

  // Direct axios client access if needed
  client: axiosClient,
} as ApiServices & {
  setAuthToken: (tokenProvider: () => Promise<string | null>) => void;
  client: typeof axiosClient;
};

// Export the type for the complete API
export type MentaraApi = typeof api;

// Re-export service types for convenience
export type { ApiServices } from "./services";
export * from "./services";

// Export error handler types
export * from "./errorHandler";
