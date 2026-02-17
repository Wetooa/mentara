"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useApi } from "@/lib/api";
import type { 
  LoginDto as ModeratorLoginDto, 
} from "@/lib/api";
import { TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from "@/lib/constants/auth";

// Local type definitions for moderator auth
interface ModeratorUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'moderator';
  emailVerified: boolean;
}

interface ModeratorAuthResponse {
  user: ModeratorUser;
  token: string;
  message?: string;
}

export interface UseModeratorAuthReturn {
  user: ModeratorUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: ModeratorLoginDto) => Promise<ModeratorAuthResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
  getDashboardData: () => Promise<void>;
  getModerationQueue: (params?: any) => Promise<void>;
  takeModerationAction: (data: any) => Promise<void>;
}

export function useModeratorAuth(): UseModeratorAuthReturn {
  const router = useRouter();
  const queryClient = useQueryClient();
  const api = useApi();
  const [error, setError] = useState<string | null>(null);

  const { 
    data: user, 
    isLoading, 
    error: queryError 
  } = useQuery({
    queryKey: ["auth", "moderator", "current-user"],
    queryFn: () => api.auth.moderator.getCurrentUser(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const isAuthenticated = !!user;

  const loginMutation = useMutation({
    mutationFn: (credentials: ModeratorLoginDto) => api.auth.moderator.login(credentials),
    onSuccess: (data) => {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refreshToken);
      queryClient.setQueryData(["auth", "moderator", "current-user"], data.user);
      setError(null);
      toast.success("Moderator access granted");
      router.push("/moderator");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Moderator login failed";
      setError(message);
      toast.error(message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.auth.moderator.logout(),
    onSuccess: () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      queryClient.clear();
      setError(null);
      toast.success("Logged out successfully");
      router.push("/auth/sign-in");
    },
    onError: () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      queryClient.clear();
      router.push("/auth/sign-in");
    },
  });

  const takeActionMutation = useMutation({
    mutationFn: (data: any) => api.auth.moderator.takeModerationAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "moderator", "queue"] });
      toast.success("Moderation action completed");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Action failed";
      toast.error(message);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => 
      api.auth.moderator.changePassword(data),
    onSuccess: () => toast.success("Password changed successfully!"),
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Password change failed";
      setError(message);
      toast.error(message);
    },
  });

  const { refetch: refetchDashboardData } = useQuery({
    queryKey: ["auth", "moderator", "dashboard"],
    queryFn: () => api.auth.moderator.getDashboardData(),
    enabled: isAuthenticated,
  });

  const { refetch: refetchModerationQueue } = useQuery({
    queryKey: ["auth", "moderator", "queue"],
    queryFn: () => api.auth.moderator.getModerationQueue(),
    enabled: isAuthenticated,
  });

  const login = useCallback(
    (credentials: ModeratorLoginDto) => loginMutation.mutateAsync(credentials),
    [loginMutation]
  );

  const logout = useCallback(
    () => logoutMutation.mutateAsync(),
    [logoutMutation]
  );

  const refreshToken = useCallback(async () => {
    try {
      const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
      if (!refreshTokenValue) throw new Error("No refresh token found");

      const response = await api.auth.moderator.refreshToken(refreshTokenValue);
      localStorage.setItem(TOKEN_STORAGE_KEY, response.accessToken);
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, response.refreshToken);
      queryClient.invalidateQueries({ queryKey: ["auth", "moderator", "current-user"] });
    } catch (err) {
      await logout();
    }
  }, [api.auth.moderator, queryClient, logout]);

  const changePassword = useCallback(
    (data: { currentPassword: string; newPassword: string }) => 
      changePasswordMutation.mutateAsync(data),
    [changePasswordMutation]
  );

  const getDashboardData = useCallback(async () => {
    await refetchDashboardData();
  }, [refetchDashboardData]);

  const getModerationQueue = useCallback(async (params?: any) => {
    await refetchModerationQueue();
  }, [refetchModerationQueue]);

  const takeModerationAction = useCallback(
    (data: any) => takeActionMutation.mutateAsync(data),
    [takeActionMutation]
  );

  return {
    user: user || null,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
    error: error || (queryError instanceof Error ? queryError.message : null),
    login,
    logout,
    refreshToken,
    changePassword,
    getDashboardData,
    getModerationQueue,
    takeModerationAction,
  };
}