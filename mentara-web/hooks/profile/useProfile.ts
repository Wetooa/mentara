import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME, GC_TIME } from "@/lib/constants/react-query";
import { hasAuthToken } from "@/lib/constants/auth";
import {
  PublicProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UserReportDto,
  ReportUserResponse,
} from "@/lib/api/services/profile";
import { toast } from "sonner";
import { MentaraApiError } from "@/lib/api/errorHandler";

// Hook for fetching a user's public profile
export function useProfile(userId: string) {
  const api = useApi();

  return useQuery({
    queryKey: queryKeys.profile.byId(userId),
    queryFn: (): Promise<PublicProfileResponse> => {
      return api.profile.getProfile(userId);
    },
    enabled: !!userId && hasAuthToken(),
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 errors (auth failures)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Hook for updating own profile (text fields only)
export function useUpdateProfile() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      profileData: UpdateProfileRequest
    ): Promise<UpdateProfileResponse> => {
      return api.profile.updateProfile(profileData);
    },
    onMutate: async (newProfileData) => {
      // Cancel any outgoing refetches for current user profile
      await queryClient.cancelQueries({ queryKey: queryKeys.profile.all });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData(queryKeys.profile.current());

      // Optimistically update profile data
      queryClient.setQueryData(
        queryKeys.profile.current(),
        (old: PublicProfileResponse | undefined) => {
          if (!old) return old;

          return {
            ...old,
            user: {
              ...old.user,
              ...newProfileData,
              updatedAt: new Date().toISOString(),
            },
          };
        }
      );

      // Return context for rollback
      return { previousProfile };
    },
    onError: (error: MentaraApiError, variables, context) => {
      // Rollback the optimistic update
      if (context?.previousProfile) {
        queryClient.setQueryData(queryKeys.profile.current(), context.previousProfile);
      }

      toast.error("Failed to update profile", {
        description: error.message || "Please try again later.",
      });
    },
    onSuccess: (data) => {
      // Invalidate all profile queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });

      toast.success("Profile updated successfully!");
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

// Hook for updating profile with file uploads
export function useUpdateProfileWithFiles(userId: string) {
  const api = useApi();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      profileData,
      files,
    }: {
      profileData: UpdateProfileRequest;
      files?: { avatar?: File; cover?: File };
    }): Promise<UpdateProfileResponse> => {
      return api.profile.updateProfileWithFiles(profileData, userId, files);
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to update profile", {
        description: error.message || "Please try again later.",
      });
    },
    onSuccess: (data) => {
      // Invalidate all profile queries
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      toast.success("Profile updated successfully!");
    },
  });
}

// Hook for uploading profile avatar only
export function useUploadAvatar() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File): Promise<{ avatarUrl: string }> => {
      return api.profile.uploadAvatar(file);
    },
    onSuccess: (data) => {
      // Update all profile queries with new avatar URL
      queryClient.setQueryData(
        queryKeys.profile.current(),
        (old: PublicProfileResponse | undefined) => {
          if (!old) return old;

          return {
            ...old,
            user: {
              ...old.user,
              avatarUrl: data.avatarUrl,
              updatedAt: new Date().toISOString(),
            },
          };
        }
      );

      toast.success("Profile picture updated!");
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to update profile picture", {
        description:
          error.message || "Please try again with a different image.",
      });
    },
  });
}

// Hook for uploading cover image only
export function useUploadCoverImage() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File): Promise<{ coverImageUrl: string }> => {
      return api.profile.uploadCoverImage(file);
    },
    onSuccess: (data) => {
      // Update all profile queries with new cover image URL
      queryClient.setQueryData(
        queryKeys.profile.current(),
        (old: PublicProfileResponse | undefined) => {
          if (!old) return old;

          return {
            ...old,
            user: {
              ...old.user,
              coverImageUrl: data.coverImageUrl,
              updatedAt: new Date().toISOString(),
            },
          };
        }
      );

      toast.success("Cover image updated!");
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to update cover image", {
        description:
          error.message || "Please try again with a different image.",
      });
    },
  });
}

// Hook for reporting a user profile
export function useReportUser() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      reportData,
    }: {
      userId: string;
      reportData: UserReportDto;
    }): Promise<ReportUserResponse> => {
      return api.profile.reportUser(userId, reportData);
    },
    onSuccess: (data, variables) => {
      toast.success("Report submitted successfully", {
        description: "Thank you for helping keep our community safe.",
      });
      
      // Optionally invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.profile.byId(variables.userId) 
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to submit report", {
        description: error.message || "Please try again later.",
      });
    },
  });
}

// Utility hook to check if the current user is viewing their own profile
export function useIsOwnProfile(profileUserId: string) {
  // Note: useAuth is imported at the component level to avoid circular dependencies
  // Components should import useAuth directly from the context
  return false; // This hook is mainly for reference - use useAuth directly in components
}
