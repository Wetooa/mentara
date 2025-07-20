"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useApi } from "@/lib/api";
import type { 
  LoginDto as ClientLoginDto, 
  RegisterClientDto as ClientRegisterDto, 
  ClientAuthResponse,
  ClientUser
} from "@/lib/api";

export interface UseClientAuthReturn {
  // Auth state
  user: ClientUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Auth actions
  login: (credentials: ClientLoginDto) => Promise<ClientAuthResponse>;
  register: (credentials: ClientRegisterDto) => Promise<ClientAuthResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;

  // Profile actions
  updateProfile: (profile: { goals?: string[]; preferences?: Record<string, any> }) => Promise<void>;
  completeOnboarding: () => Promise<void>;

  // Status checks
  checkOnboardingStatus: () => Promise<void>;
  
  // Password management
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
}

export function useClientAuth(): UseClientAuthReturn {
  const router = useRouter();
  const queryClient = useQueryClient();
  const api = useApi();
  const [error, setError] = useState<string | null>(null);

  // Get current user query
  const { 
    data: user, 
    isLoading, 
    error: queryError 
  } = useQuery({
    queryKey: ["auth", "client", "current-user"],
    queryFn: () => api.auth.client.getCurrentUser(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isAuthenticated = !!user;

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: ClientLoginDto) => api.auth.client.login(credentials),
    onSuccess: (data) => {
      // Store tokens
      localStorage.setItem("access_token", data.accessToken);
      localStorage.setItem("refresh_token", data.refreshToken);
      
      // Update query cache
      queryClient.setQueryData(["auth", "client", "current-user"], data.user);
      
      // Clear any errors
      setError(null);
      
      // Show success message
      toast.success("Welcome back!");
      
      // Navigate based on onboarding status
      if (data.user.isOnboardingComplete) {
        router.push("/user");
      } else {
        router.push("/client/onboarding");
      }
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      toast.error(message);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (credentials: ClientRegisterDto) => api.auth.client.register(credentials),
    onSuccess: (data) => {
      // Store tokens
      localStorage.setItem("access_token", data.accessToken);
      localStorage.setItem("refresh_token", data.refreshToken);
      
      // Update query cache
      queryClient.setQueryData(["auth", "client", "current-user"], data.user);
      
      // Clear any errors
      setError(null);
      
      // Show success message
      toast.success("Account created successfully!");
      
      // Navigate to onboarding
      router.push("/client/onboarding");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
      toast.error(message);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => api.auth.client.logout(),
    onSuccess: () => {
      // Clear tokens
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      
      // Clear query cache
      queryClient.clear();
      
      // Clear any errors
      setError(null);
      
      // Show success message
      toast.success("Logged out successfully");
      
      // Navigate to client sign-in
      router.push("/client/sign-in");
    },
    onError: (err) => {
      // Even if logout fails on server, clear local state
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      queryClient.clear();
      
      const message = err instanceof Error ? err.message : "Logout failed";
      toast.error(message);
      
      // Still navigate to sign-in
      router.push("/client/sign-in");
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (profile: { goals?: string[]; preferences?: Record<string, any> }) => 
      api.auth.client.updateProfile(profile),
    onSuccess: (updatedUser) => {
      // Update query cache
      queryClient.setQueryData(["auth", "client", "current-user"], updatedUser);
      toast.success("Profile updated successfully!");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Profile update failed";
      setError(message);
      toast.error(message);
    },
  });

  // Complete onboarding mutation
  const completeOnboardingMutation = useMutation({
    mutationFn: () => api.auth.client.completeOnboarding(),
    onSuccess: () => {
      // Refetch user data to get updated onboarding status
      queryClient.invalidateQueries({ queryKey: ["auth", "client", "current-user"] });
      toast.success("Onboarding completed!");
      router.push("/user");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Failed to complete onboarding";
      setError(message);
      toast.error(message);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => 
      api.auth.client.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully!");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Password change failed";
      setError(message);
      toast.error(message);
    },
  });

  // Get onboarding status query
  const { refetch: refetchOnboardingStatus } = useQuery({
    queryKey: ["auth", "client", "onboarding-status"],
    queryFn: () => api.auth.client.getOnboardingStatus(),
    enabled: isAuthenticated,
  });

  // Callback functions
  const login = useCallback(
    (credentials: ClientLoginDto) => loginMutation.mutateAsync(credentials),
    [loginMutation]
  );

  const register = useCallback(
    (credentials: ClientRegisterDto) => registerMutation.mutateAsync(credentials),
    [registerMutation]
  );

  const logout = useCallback(
    () => logoutMutation.mutateAsync(),
    [logoutMutation]
  );

  const refreshToken = useCallback(async () => {
    try {
      const refreshTokenValue = localStorage.getItem("refresh_token");
      if (!refreshTokenValue) {
        throw new Error("No refresh token found");
      }

      const response = await api.auth.client.refreshToken(refreshTokenValue);
      
      // Update tokens
      localStorage.setItem("access_token", response.accessToken);
      localStorage.setItem("refresh_token", response.refreshToken);
      
      // Refetch user data
      queryClient.invalidateQueries({ queryKey: ["auth", "client", "current-user"] });
    } catch (err) {
      // Refresh failed, logout user
      await logout();
    }
  }, [api.auth.client, queryClient, logout]);

  const updateProfile = useCallback(
    (profile: { goals?: string[]; preferences?: Record<string, any> }) => 
      updateProfileMutation.mutateAsync(profile),
    [updateProfileMutation]
  );

  const completeOnboarding = useCallback(
    () => completeOnboardingMutation.mutateAsync(),
    [completeOnboardingMutation]
  );

  const checkOnboardingStatus = useCallback(async () => {
    await refetchOnboardingStatus();
  }, [refetchOnboardingStatus]);

  const changePassword = useCallback(
    (data: { currentPassword: string; newPassword: string }) => 
      changePasswordMutation.mutateAsync(data),
    [changePasswordMutation]
  );

  return {
    // Auth state
    user: user || null,
    isAuthenticated,
    isLoading: isLoading || 
               loginMutation.isPending || 
               registerMutation.isPending || 
               logoutMutation.isPending,
    error: error || (queryError instanceof Error ? queryError.message : null),

    // Auth actions
    login,
    register,
    logout,
    refreshToken,

    // Profile actions
    updateProfile,
    completeOnboarding,

    // Status checks
    checkOnboardingStatus,

    // Password management
    changePassword,
  };
}