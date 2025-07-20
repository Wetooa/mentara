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

      // Store token in localStorage
      localStorage.setItem("token", response.token);

      // Store user data
      localStorage.setItem("user", JSON.stringify(response.user));

      // Redirect based on role
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
