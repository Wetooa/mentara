import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

/**
 * Hook to set up API authentication with JWT token
 * This should be called once at the app level to configure the API client
 */
export function useApiAuth() {
  const { accessToken } = useAuth();

  useEffect(() => {
    // Set up the token provider for the API client
    api.setAuthToken(async () => {
      try {
        return accessToken;
      } catch (error) {
        return null;
      }
    });
  }, [accessToken]);
}

export default useApiAuth;
