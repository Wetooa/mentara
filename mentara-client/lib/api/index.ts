// Main API entry point - provides the complete API object with all services
// Usage: import { api } from '@/lib/api'
// Then: api.auth.getCurrentUser(), api.client.getProfile(), etc.

import { useAuth } from '@clerk/nextjs';
import { createAxiosClient, setTokenProvider } from "./client";
import { createApiServices, type ApiServices } from "./services";

// Create the axios client
const axiosClient = createAxiosClient();

// Create all API services using the axios client
const apiServices = createApiServices(axiosClient);

// React hook for API access with authentication
export const useApi = () => {
  const { getToken } = useAuth();
  
  // Set up token provider for this session
  if (getToken) {
    setTokenProvider(getToken);
  }
  
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
