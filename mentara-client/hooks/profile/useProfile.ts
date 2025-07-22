import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { 
  PublicProfileResponse, 
  UpdateProfileRequest, 
  UpdateProfileResponse 
} from '@/lib/api/services/profile';
import { toast } from 'sonner';
import { MentaraApiError } from '@/lib/api/errorHandler';

// Hook for fetching a user's public profile
export function useProfile(userId: string) {
  const api = useApi();

  return useQuery({
    queryKey: ['profile', userId],
    queryFn: (): Promise<PublicProfileResponse> => {
      return api.profile.getProfile(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for updating own profile (text fields only)
export function useUpdateProfile() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
      return api.profile.updateProfile(profileData);
    },
    onMutate: async (newProfileData) => {
      // Cancel any outgoing refetches for current user profile
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      
      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData(['profile']);
      
      // Optimistically update profile data
      queryClient.setQueryData(['profile'], (old: PublicProfileResponse | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          user: {
            ...old.user,
            ...newProfileData,
            updatedAt: new Date().toISOString(),
          }
        };
      });
      
      // Return context for rollback
      return { previousProfile };
    },
    onError: (error: MentaraApiError, variables, context) => {
      // Rollback the optimistic update
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile'], context.previousProfile);
      }
      
      toast.error('Failed to update profile', {
        description: error.message || 'Please try again later.',
      });
    },
    onSuccess: (data) => {
      // Invalidate all profile queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      toast.success('Profile updated successfully!');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// Hook for updating profile with file uploads
export function useUpdateProfileWithFiles() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      profileData, 
      files 
    }: { 
      profileData: UpdateProfileRequest;
      files?: { avatar?: File; cover?: File };
    }): Promise<UpdateProfileResponse> => {
      return api.profile.updateProfileWithFiles(profileData, files);
    },
    onError: (error: MentaraApiError) => {
      toast.error('Failed to update profile', {
        description: error.message || 'Please try again later.',
      });
    },
    onSuccess: (data) => {
      // Invalidate all profile queries
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      toast.success('Profile updated successfully!');
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
      queryClient.setQueryData(['profile'], (old: PublicProfileResponse | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          user: {
            ...old.user,
            avatarUrl: data.avatarUrl,
            updatedAt: new Date().toISOString(),
          }
        };
      });
      
      toast.success('Profile picture updated!');
    },
    onError: (error: MentaraApiError) => {
      toast.error('Failed to update profile picture', {
        description: error.message || 'Please try again with a different image.',
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
      queryClient.setQueryData(['profile'], (old: PublicProfileResponse | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          user: {
            ...old.user,
            coverImageUrl: data.coverImageUrl,
            updatedAt: new Date().toISOString(),
          }
        };
      });
      
      toast.success('Cover image updated!');
    },
    onError: (error: MentaraApiError) => {
      toast.error('Failed to update cover image', {
        description: error.message || 'Please try again with a different image.',
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