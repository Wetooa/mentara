"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/constants/auth";
import type { UserRole } from "@/contexts/AuthContext";

// Profile data interface that normalizes across all user types
export interface UserProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  // Additional role-specific fields can be included but these are the core ones
  [key: string]: any;
}

/**
 * Hook to fetch the current user's profile data based on their role.
 * This hook automatically determines the correct API endpoint to call
 * based on the authenticated user's role (client, therapist, admin, moderator).
 */
export function useCurrentUserProfile() {
  const { user, isAuthenticated } = useAuth();
  const api = useApi();

  return useQuery({
    queryKey: ["auth", "current-user-profile", user?.id, user?.role],
    queryFn: async (): Promise<UserProfileData> => {
      if (!user?.role) {
        throw new Error("User role not available");
      }

      let profileData: any;

      // Call the appropriate role-specific profile endpoint
      switch (user.role) {
        case "client":
          profileData = await api.auth.client.getProfile();
          break;
        case "therapist":
          profileData = await api.auth.therapist.getProfile();
          break;
        case "admin":
          profileData = await api.auth.admin.getProfile();
          break;
        case "moderator":
          profileData = await api.auth.moderator.getProfile();
          break;
        default:
          throw new Error(`Unsupported user role: ${user.role}`);
      }

      // Normalize the profile data structure
      return {
        id: profileData.userId || profileData.id || user.id,
        firstName: profileData.user?.firstName || profileData.firstName || "",
        lastName: profileData.user?.lastName || profileData.lastName || "",
        email: profileData.user?.email || profileData.email || "",
        avatarUrl: profileData.user?.avatarUrl || profileData.avatarUrl,
        role: user.role,
        ...profileData, // Include any additional role-specific data
      };
    },
    enabled: isAuthenticated && !!user?.id && !!user?.role && hasAuthToken(),
    staleTime: 5 * 60 * 1000, // 5 minutes - profile data doesn't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 errors (auth failures)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2; // Limited retries for profile data
    },
  });
}

/**
 * Hook that returns just the essential user display data (name, avatar, role)
 * with loading and error states for UI components.
 */
export function useCurrentUserDisplay() {
  const { data: profile, isLoading, error } = useCurrentUserProfile();
  
  return {
    firstName: profile?.firstName,
    lastName: profile?.lastName,
    fullName: profile ? `${profile.firstName} ${profile.lastName}`.trim() : undefined,
    avatarUrl: profile?.avatarUrl,
    role: profile?.role,
    isLoading,
    error,
    hasData: !!profile,
  };
}