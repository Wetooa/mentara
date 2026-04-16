import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { STALE_TIME, GC_TIME } from '@/lib/constants/react-query';
import { toast } from 'sonner';
import { MentaraApiError } from '@/lib/api/errorHandler';
import type { 
  User,
  TherapistApplication,
  SystemStats,
  UserGrowthParams,
  UserGrowthData,
  EngagementParams,
  EngagementData,
  ModerationReport,
  ModerationReportParams,
  SystemConfig,
  FeatureFlag,
  AdminUserListParams,
  AdminUserCreateRequest,
  AdminUserUpdateRequest,
  UserRoleUpdateRequest,
  UserSuspendRequest,
  UpdateModerationReportRequest,
  UpdateFeatureFlagRequest
} from '@/types/api';

/**
 * Hook for checking admin permissions
 */
export function useAdminCheck() {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.admin.checkAdmin(),
    queryFn: () => api.admin.checkAdmin(),
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
    retry: false,
  });
}

/**
 * Hook for fetching admin dashboard data
 */
export function useAdminDashboard() {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.admin.dashboard(),
    queryFn: () => api.dashboard.getAdminDashboard(),
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching admin users list (basic query only)
 */
export function useAdminUsersList(params: AdminUserListParams = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.admin.users.list(params),
    queryFn: () => api.admin.users.getList(params),
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching specific admin user by ID
 */
export function useAdminUser(userId: string | null) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.admin.users.byId(userId || ''),
    queryFn: () => api.admin.users.getById(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for creating a new user (admin functionality)
 */
export function useCreateUser() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: AdminUserCreateRequest) => 
      api.admin.users.create(userData),
    onSuccess: (data) => {
      toast.success('User created successfully!');
      
      // Invalidate users list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.users.list() 
      });
      
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.dashboard() 
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to create user');
    },
  });
}

/**
 * Hook for updating user data (admin functionality)
 */
export function useUpdateUser() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      userId, 
      userData 
    }: { 
      userId: string; 
      userData: AdminUserUpdateRequest 
    }) => api.admin.users.update(userId, userData),
    onMutate: async ({ userId, userData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.admin.users.byId(userId) 
      });
      
      // Snapshot the previous value
      const previousUser = queryClient.getQueryData(
        queryKeys.admin.users.byId(userId)
      );
      
      // Optimistically update
      queryClient.setQueryData(
        queryKeys.admin.users.byId(userId),
        (old: User | undefined) => 
          old ? { ...old, ...userData } : old
      );
      
      return { previousUser, userId };
    },
    onError: (error: MentaraApiError, { userId }, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(
          queryKeys.admin.users.byId(userId),
          context.previousUser
        );
      }
      toast.error(error?.message || 'Failed to update user');
    },
    onSuccess: (data, { userId }) => {
      toast.success('User updated successfully!');
      
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.users.list() 
      });
    },
  });
}

/**
 * Hook for updating user role (admin functionality)
 */
export function useUpdateUserRole() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      userId, 
      roleData 
    }: { 
      userId: string; 
      roleData: UserRoleUpdateRequest 
    }) => api.admin.users.updateRole(userId, roleData),
    onSuccess: (data, { userId, roleData }) => {
      toast.success(`User role updated to ${roleData.role}!`);
      
      // Invalidate user data
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.users.byId(userId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.users.list() 
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to update user role');
    },
  });
}

/**
 * Hook for suspending a user (admin functionality)
 */
export function useSuspendUser() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      userId, 
      suspendData 
    }: { 
      userId: string; 
      suspendData: UserSuspendRequest 
    }) => api.admin.users.suspend(userId, suspendData),
    onSuccess: (data, { userId }) => {
      toast.success('User suspended successfully!');
      
      // Invalidate user data
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.users.byId(userId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.users.list() 
      });
      
      // Invalidate moderation data
      queryClient.invalidateQueries({ 
        queryKey: ['contentModeration', 'userViolations', userId] 
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to suspend user');
    },
  });
}

/**
 * Hook for unsuspending a user (admin functionality)
 */
export function useUnsuspendUser() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => api.admin.users.unsuspend(userId),
    onSuccess: (data, userId) => {
      toast.success('User unsuspended successfully!');
      
      // Invalidate user data
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.users.byId(userId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.users.list() 
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to unsuspend user');
    },
  });
}

/**
 * Hook for deleting a user (admin functionality)
 */
export function useDeleteUser() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => api.admin.users.delete(userId),
    onSuccess: (data, userId) => {
      toast.success('User deleted successfully!');
      
      // Invalidate users list
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'users'] 
      });
      
      // Remove specific user from cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.admin.users.byId(userId) 
      });
      
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.dashboard() 
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to delete user');
    },
  });
}

/**
 * Hook for fetching therapist applications (admin functionality)
 */
export function useAdminTherapistApplications(params: { status?: string; limit?: number; offset?: number } = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.admin.therapistApplications.list(params),
    queryFn: () => api.admin.therapistApplications.getList(params),
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching specific therapist application (admin functionality)
 */
export function useAdminTherapistApplication(applicationId: string | null) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.admin.therapistApplications.byId(applicationId || ''),
    queryFn: () => api.admin.therapistApplications.getById(applicationId!),
    enabled: !!applicationId,
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for updating therapist application status (admin functionality)
 */
export function useUpdateTherapistApplicationStatus() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      applicationId, 
      data 
    }: { 
      applicationId: string; 
      data: { status: string; reviewedBy?: string; notes?: string } 
    }) => api.admin.therapistApplications.updateStatus(applicationId, data),
    onSuccess: (result, { applicationId, data }) => {
      const statusText = data.status === 'approved' ? 'approved' : 
                        data.status === 'rejected' ? 'rejected' : 'updated';
      toast.success(`Application ${statusText} successfully!`);
      
      // Invalidate applications list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.therapistApplications.list() 
      });
      
      // Invalidate specific application
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.therapistApplications.byId(applicationId) 
      });
      
      // If approved, invalidate therapist queries
      if (data.status === 'approved') {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.therapists.all 
        });
      }
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to update application status');
    },
  });
}

/**
 * Hook for fetching system analytics (admin functionality)
 */
export function useAdminSystemStats() {
  const api = useApi();
  
  return useQuery({
    queryKey: [...queryKeys.admin.all, 'analytics', 'systemStats'],
    queryFn: () => api.admin.analytics.getSystemStats(),
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching user growth analytics (admin functionality)
 */
export function useAdminUserGrowth(params: UserGrowthParams = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: [...queryKeys.admin.all, 'analytics', 'userGrowth', params],
    queryFn: () => api.admin.analytics.getUserGrowth(params),
    staleTime: STALE_TIME.LONG, // 10 minutes
    gcTime: GC_TIME.VERY_LONG, // 30 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching engagement analytics (admin functionality)
 */
export function useAdminEngagement(params: EngagementParams = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: [...queryKeys.admin.all, 'analytics', 'engagement', params],
    queryFn: () => api.admin.analytics.getEngagement(params),
    staleTime: STALE_TIME.LONG, // 10 minutes
    gcTime: GC_TIME.VERY_LONG, // 30 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching platform overview analytics (admin functionality)
 */
export function useAdminPlatformOverview() {
  const api = useApi();
  
  return useQuery({
    queryKey: [...queryKeys.admin.all, 'analytics', 'platformOverview'],
    queryFn: () => api.admin.analytics.getPlatformOverview(),
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching matching performance analytics (admin functionality)
 * TODO: Create backend endpoint for matching performance analytics
 */
export function useAdminMatchingPerformance(startDate?: string, endDate?: string) {
  const api = useApi();
  
  return useQuery({
    queryKey: [...queryKeys.admin.all, 'analytics', 'matchingPerformance', startDate, endDate],
    queryFn: () => Promise.resolve({}), // TODO: Replace with api.admin.analytics.getMatchingPerformance(startDate, endDate) when endpoint is created
    staleTime: STALE_TIME.LONG, // 10 minutes
    gcTime: GC_TIME.VERY_LONG, // 30 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching moderation reports (admin functionality)
 */
export function useAdminModerationReports(params: ModerationReportParams = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.admin.reports.list(params),
    queryFn: () => api.admin.moderation.getReports(params),
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for updating moderation report (admin functionality)
 */
export function useUpdateModerationReport() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      reportId, 
      data 
    }: { 
      reportId: string; 
      data: UpdateModerationReportRequest 
    }) => api.admin.moderation.updateReport(reportId, data),
    onSuccess: (result, { reportId }) => {
      toast.success('Moderation report updated successfully!');
      
      // Invalidate reports list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.reporting.all 
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to update moderation report');
    },
  });
}

/**
 * Hook for fetching flagged content (admin functionality)
 */
export function useAdminFlaggedContent(params: { type?: string; page?: number; limit?: number } = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.admin.moderation.flaggedContent(params),
    queryFn: () => api.admin.moderation.getFlaggedContent(params),
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for moderating content (admin functionality)
 */
export function useAdminModerateContent() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      contentType, 
      contentId, 
      action, 
      reason 
    }: { 
      contentType: string; 
      contentId: string; 
      action: 'approve' | 'remove' | 'flag'; 
      reason?: string 
    }) => api.admin.moderation.moderateContent(contentType, contentId, action, reason),
    onSuccess: (result, { action }) => {
      toast.success(`Content ${action}d successfully!`);
      
      // Invalidate flagged content
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.moderation.flaggedContent() 
      });
      
      // Invalidate content moderation data
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.moderator.flaggedContent() 
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to moderate content');
    },
  });
}

/**
 * Hook for fetching system configuration (admin functionality)
 */
export function useAdminSystemConfig() {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.admin.config.system(),
    queryFn: () => api.admin.config.get(),
    staleTime: STALE_TIME.LONG, // 10 minutes
    gcTime: GC_TIME.VERY_LONG, // 30 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for updating system configuration (admin functionality)
 */
export function useUpdateSystemConfig() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (config: Partial<SystemConfig>) => 
      api.admin.config.update(config),
    onSuccess: () => {
      toast.success('System configuration updated successfully!');
      
      // Invalidate config cache
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.config.system() 
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to update system configuration');
    },
  });
}

/**
 * Hook for fetching feature flags (admin functionality)
 */
export function useAdminFeatureFlags() {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.admin.config.featureFlags(),
    queryFn: () => api.admin.config.getFeatureFlags(),
    staleTime: STALE_TIME.LONG, // 10 minutes
    gcTime: GC_TIME.VERY_LONG, // 30 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for updating feature flag (admin functionality)
 */
export function useUpdateFeatureFlag() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      flagName, 
      data 
    }: { 
      flagName: string; 
      data: UpdateFeatureFlagRequest 
    }) => api.admin.config.updateFeatureFlag(flagName, data),
    onSuccess: (result, { flagName }) => {
      toast.success(`Feature flag '${flagName}' updated successfully!`);
      
      // Invalidate feature flags cache
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.config.featureFlags() 
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to update feature flag');
    },
  });
}

/**
 * Hook for fetching admin profile
 */
export function useAdminProfile() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['admin', 'profile'],
    queryFn: () => api.admin.profile.get(),
    staleTime: STALE_TIME.LONG, // 10 minutes
    gcTime: GC_TIME.VERY_LONG, // 30 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for updating admin profile
 */
export function useUpdateAdminProfile() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<User>) => api.admin.profile.update(data),
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      
      // Invalidate profile cache
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'profile'] 
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to update profile');
    },
  });
}