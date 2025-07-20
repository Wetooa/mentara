import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/api";

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
      localStorage.setItem("token", response.token);

      // Redirect based on role (from server response)
      const dashboardPath = `/${response.user.role}`;
      router.push(dashboardPath);
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
