import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/api";
import { TOKEN_STORAGE_KEY } from "@/lib/constants/auth";

interface LoginCredentials {
  email: string;
  password: string;
}

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const api = useApi();

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);

    try {
      // Use universal login endpoint
      const response = await api.auth.login(credentials);

      // Store only token in localStorage (secure)
      localStorage.setItem(TOKEN_STORAGE_KEY, response.token);

      // Handle immediate post-login redirect using backend data
      if (response.user.role === "client") {
        // Check if client has seen therapist recommendations (backend now returns this)
        const hasSeenRecommendations = response.user.client?.hasSeenTherapistRecommendations;
        
        if (hasSeenRecommendations === false) {
          router.push("/client/welcome");
        } else {
          router.push("/client");
        }
      } else {
        // For non-client roles, redirect to their dashboard
        router.push(`/${response.user.role}`);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
  };
}
