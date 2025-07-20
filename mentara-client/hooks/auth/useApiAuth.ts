import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

/**
 * Hook to set up API authentication with JWT token integration
 * 
 * This hook configures the global API client with the current authentication token.
 * It should be called once at the application level to ensure all API requests
 * include the proper authentication headers.
 * 
 * @example
 * ```tsx
 * function App() {
 *   useApiAuth(); // Set up API authentication
 *   return <div>App content</div>;
 * }
 * ```
 * 
 * Features:
 * - Automatically updates API client when token changes
 * - Handles token expiration gracefully
 * - Returns null for failed token retrieval
 */
export function useApiAuth(): void {
  const { accessToken } = useAuth();

  useEffect(() => {
    // Set up the token provider for the API client
    api.setAuthToken(async (): Promise<string | null> => {
      try {
        // Return the current access token
        return accessToken || null;
      } catch (error) {
        // Log error in development for debugging
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to retrieve access token:', error);
        }
        return null;
      }
    });
  }, [accessToken]);
}

export default useApiAuth;
