"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useApi } from "@/lib/api";
import { 
  AdminLoginDto, 
  AdminUser,
  AdminAuthResponse,
  AuditLogQueryParams,
} from "@/lib/api/services/auth";

export interface UseAdminAuthReturn {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: AdminLoginDto) => Promise<AdminAuthResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
  getDashboardData: () => Promise<void>;
  getAuditLogs: (params?: AuditLogQueryParams) => Promise<void>;
}

export function useAdminAuth(): UseAdminAuthReturn {
  const router = useRouter();
  const queryClient = useQueryClient();
  const api = useApi();
  const [error, setError] = useState<string | null>(null);

  const { 
    data: user, 
    isLoading, 
    error: queryError 
  } = useQuery({
    queryKey: ["auth", "admin", "current-user"],
    queryFn: () => api.auth.admin.getCurrentUser(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const isAuthenticated = !!user;

  const loginMutation = useMutation({
    mutationFn: (credentials: AdminLoginDto) => api.auth.admin.login(credentials),
    onSuccess: (data) => {
      localStorage.setItem("access_token", data.accessToken);
      localStorage.setItem("refresh_token", data.refreshToken);
      queryClient.setQueryData(["auth", "admin", "current-user"], data.user);
      setError(null);
      toast.success("Admin access granted");
      router.push("/admin");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Admin login failed";
      setError(message);
      toast.error(message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.auth.admin.logout(),
    onSuccess: () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      queryClient.clear();
      setError(null);
      toast.success("Logged out successfully");
      router.push("/admin/sign-in");
    },
    onError: () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      queryClient.clear();
      router.push("/admin/sign-in");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => 
      api.auth.admin.changePassword(data),
    onSuccess: () => toast.success("Password changed successfully!"),
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Password change failed";
      setError(message);
      toast.error(message);
    },
  });

  const { refetch: refetchDashboardData } = useQuery({
    queryKey: ["auth", "admin", "dashboard"],
    queryFn: () => api.auth.admin.getDashboardData(),
    enabled: isAuthenticated,
  });

  const { refetch: refetchAuditLogs } = useQuery({
    queryKey: ["auth", "admin", "audit-logs"],
    queryFn: () => api.auth.admin.getAuditLogs(),
    enabled: false, // Only fetch when explicitly called
  });

  const login = useCallback(
    (credentials: AdminLoginDto) => loginMutation.mutateAsync(credentials),
    [loginMutation]
  );

  const logout = useCallback(
    () => logoutMutation.mutateAsync(),
    [logoutMutation]
  );

  const refreshToken = useCallback(async () => {
    try {
      const refreshTokenValue = localStorage.getItem("refresh_token");
      if (!refreshTokenValue) throw new Error("No refresh token found");

      const response = await api.auth.admin.refreshToken(refreshTokenValue);
      localStorage.setItem("access_token", response.accessToken);
      localStorage.setItem("refresh_token", response.refreshToken);
      queryClient.invalidateQueries({ queryKey: ["auth", "admin", "current-user"] });
    } catch (err) {
      await logout();
    }
  }, [api.auth.admin, queryClient, logout]);

  const changePassword = useCallback(
    (data: { currentPassword: string; newPassword: string }) => 
      changePasswordMutation.mutateAsync(data),
    [changePasswordMutation]
  );

  const getDashboardData = useCallback(async () => {
    await refetchDashboardData();
  }, [refetchDashboardData]);

  const getAuditLogs = useCallback(async (params?: AuditLogQueryParams) => {
    await refetchAuditLogs();
  }, [refetchAuditLogs]);

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
    getAuditLogs,
  };
}