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

      // Keep loading state during redirect to show loading screen
      // Redirect immediately - AuthProvider will handle welcome page logic
      router.push(`/${response.user.role}`);
      
      // Don't clear loading state immediately - let the redirect happen
      // The loading state will be cleared when the component unmounts or redirect completes
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
    // Note: Don't clear loading in finally - keep it true during redirect
  };

  return {
    login,
    isLoading,
  };
}
