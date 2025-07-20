"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useApi } from "@/lib/api";
import type { 
  LoginDto as TherapistLoginDto, 
  TherapistAuthResponse
} from "@/lib/api";

// Temporary type - should come from mentara-commons
interface TherapistUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'therapist';
  emailVerified: boolean;
}

export interface UseTherapistAuthReturn {
  // Auth state
  user: TherapistUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Auth actions
  login: (credentials: TherapistLoginDto) => Promise<TherapistAuthResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;

  // Profile actions
  updateProfile: (profile: { 
    bio?: string; 
    specializations?: string[]; 
    availability?: Record<string, any>; 
    hourlyRate?: number; 
  }) => Promise<void>;
  
  updateAvailability: (availability: {
    schedule: Record<string, any>;
    timeZone: string;
    isAcceptingNewClients: boolean;
  }) => Promise<void>;

  // Application status
  checkApplicationStatus: () => Promise<void>;
  uploadDocuments: (files: FormData) => Promise<void>;
  checkVerificationStatus: () => Promise<void>;

  // Dashboard data
  getDashboardData: () => Promise<void>;
  
  // Password management
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
}

export function useTherapistAuth(): UseTherapistAuthReturn {
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
    queryKey: ["auth", "therapist", "current-user"],
    queryFn: () => api.auth.therapist.getCurrentUser(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isAuthenticated = !!user;

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: TherapistLoginDto) => api.auth.therapist.login(credentials),
    onSuccess: (data) => {
      // Store tokens
      localStorage.setItem("access_token", data.accessToken);
      localStorage.setItem("refresh_token", data.refreshToken);
      
      // Update query cache
      queryClient.setQueryData(["auth", "therapist", "current-user"], data.user);
      
      // Clear any errors
      setError(null);
      
      // Show success message
      toast.success("Welcome back!");
      
      // Navigate based on approval status
      if (data.user.approvalStatus === "approved") {
        router.push("/therapist");
      } else if (data.user.approvalStatus === "pending") {
        router.push("/therapist/pending-approval");
      } else if (data.user.approvalStatus === "rejected") {
        router.push("/therapist/application-rejected");
      } else if (data.user.approvalStatus === "suspended") {
        router.push("/therapist/account-suspended");
      } else {
        router.push("/therapist");
      }
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      toast.error(message);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => api.auth.therapist.logout(),
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
      
      // Navigate to therapist sign-in
      router.push("/therapist/sign-in");
    },
    onError: (err) => {
      // Even if logout fails on server, clear local state
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      queryClient.clear();
      
      const message = err instanceof Error ? err.message : "Logout failed";
      toast.error(message);
      
      // Still navigate to sign-in
      router.push("/therapist/sign-in");
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (profile: { 
      bio?: string; 
      specializations?: string[]; 
      availability?: Record<string, any>; 
      hourlyRate?: number; 
    }) => api.auth.therapist.updateProfile(profile),
    onSuccess: (updatedUser) => {
      // Update query cache
      queryClient.setQueryData(["auth", "therapist", "current-user"], updatedUser);
      toast.success("Profile updated successfully!");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Profile update failed";
      setError(message);
      toast.error(message);
    },
  });

  // Update availability mutation
  const updateAvailabilityMutation = useMutation({
    mutationFn: (availability: {
      schedule: Record<string, any>;
      timeZone: string;
      isAcceptingNewClients: boolean;
    }) => api.auth.therapist.updateAvailability(availability),
    onSuccess: () => {
      // Refetch user data and dashboard
      queryClient.invalidateQueries({ queryKey: ["auth", "therapist"] });
      toast.success("Availability updated successfully!");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Availability update failed";
      setError(message);
      toast.error(message);
    },
  });

  // Upload documents mutation
  const uploadDocumentsMutation = useMutation({
    mutationFn: (files: FormData) => api.auth.therapist.uploadDocuments(files),
    onSuccess: (result) => {
      // Refetch verification status
      queryClient.invalidateQueries({ queryKey: ["auth", "therapist", "verification-status"] });
      toast.success(`Uploaded ${result.uploadedFiles.length} document(s) successfully!`);
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Document upload failed";
      setError(message);
      toast.error(message);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => 
      api.auth.therapist.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully!");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Password change failed";
      setError(message);
      toast.error(message);
    },
  });

  // Application status query
  const { refetch: refetchApplicationStatus } = useQuery({
    queryKey: ["auth", "therapist", "application-status"],
    queryFn: () => api.auth.therapist.getApplicationStatus(),
    enabled: isAuthenticated,
  });

  // Verification status query
  const { refetch: refetchVerificationStatus } = useQuery({
    queryKey: ["auth", "therapist", "verification-status"],
    queryFn: () => api.auth.therapist.getVerificationStatus(),
    enabled: isAuthenticated,
  });

  // Dashboard data query
  const { refetch: refetchDashboardData } = useQuery({
    queryKey: ["auth", "therapist", "dashboard"],
    queryFn: () => api.auth.therapist.getDashboardData(),
    enabled: isAuthenticated && user?.approvalStatus === "approved",
  });

  // Callback functions
  const login = useCallback(
    (credentials: TherapistLoginDto) => loginMutation.mutateAsync(credentials),
    [loginMutation]
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

      const response = await api.auth.therapist.refreshToken(refreshTokenValue);
      
      // Update tokens
      localStorage.setItem("access_token", response.accessToken);
      localStorage.setItem("refresh_token", response.refreshToken);
      
      // Refetch user data
      queryClient.invalidateQueries({ queryKey: ["auth", "therapist", "current-user"] });
    } catch (err) {
      // Refresh failed, logout user
      await logout();
    }
  }, [api.auth.therapist, queryClient, logout]);

  const updateProfile = useCallback(
    (profile: { 
      bio?: string; 
      specializations?: string[]; 
      availability?: Record<string, any>; 
      hourlyRate?: number; 
    }) => updateProfileMutation.mutateAsync(profile),
    [updateProfileMutation]
  );

  const updateAvailability = useCallback(
    (availability: {
      schedule: Record<string, any>;
      timeZone: string;
      isAcceptingNewClients: boolean;
    }) => updateAvailabilityMutation.mutateAsync(availability),
    [updateAvailabilityMutation]
  );

  const checkApplicationStatus = useCallback(async () => {
    await refetchApplicationStatus();
  }, [refetchApplicationStatus]);

  const uploadDocuments = useCallback(
    (files: FormData) => uploadDocumentsMutation.mutateAsync(files),
    [uploadDocumentsMutation]
  );

  const checkVerificationStatus = useCallback(async () => {
    await refetchVerificationStatus();
  }, [refetchVerificationStatus]);

  const getDashboardData = useCallback(async () => {
    await refetchDashboardData();
  }, [refetchDashboardData]);

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
               logoutMutation.isPending ||
               updateProfileMutation.isPending ||
               updateAvailabilityMutation.isPending ||
               uploadDocumentsMutation.isPending,
    error: error || (queryError instanceof Error ? queryError.message : null),

    // Auth actions
    login,
    logout,
    refreshToken,

    // Profile actions
    updateProfile,
    updateAvailability,

    // Application status
    checkApplicationStatus,
    uploadDocuments,
    checkVerificationStatus,

    // Dashboard data
    getDashboardData,

    // Password management
    changePassword,
  };
}