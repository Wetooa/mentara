import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';

import { toast } from 'sonner';
import { MentaraApiError } from '@/lib/api/errorHandler';
import type { 
  TherapistApplication,
  ApplicationListParams,
  UpdateApplicationRequest,
  CreateApplicationRequest
} from 'mentara-commons';

/**
 * Shared retry logic for authentication and error handling
 */
const getApplicationsRetryConfig = (failureCount: number, error: MentaraApiError) => {
  // Don't retry on auth errors (401, 403)
  if (error?.status === 401 || error?.status === 403) {
    return false;
  }
  // Retry up to 2 times for other errors
  return failureCount < 2;
};

/**
 * Enhanced retry logic for application details that also excludes 404 errors
 */
const getApplicationDetailRetryConfig = (failureCount: number, error: MentaraApiError) => {
  // Don't retry on auth errors or if application doesn't exist
  if (error?.status === 401 || error?.status === 403 || error?.status === 404) {
    return false;
  }
  // Retry up to 2 times for other errors
  return failureCount < 2;
};

/**
 * Hook for fetching therapist applications list (admin functionality)
 * Uses the admin endpoint for comprehensive application data
 */
export function useTherapistApplications(params: ApplicationListParams = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: ['therapists', 'applications', 'list', params],
    queryFn: () => api.therapists.getApplications(params),
    select: (response) => {
      // Transform axios response structure: response.data.applications -> applications
      return response.data?.applications || [];
    },
    staleTime: 1000 * 60 * 2, // Consider fresh for 2 minutes (admin data changes frequently)
    retry: getApplicationsRetryConfig,
  });
}

/**
 * Hook for fetching therapist applications list with full response metadata (admin functionality)
 * Returns the complete response including pagination data
 */
export function useTherapistApplicationsWithMetadata(params: ApplicationListParams = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: ['therapists', 'applications', 'list', params, 'metadata'],
    queryFn: () => api.therapists.getApplications(params),
    select: (response) => {
      // Return the full response data structure for pagination
      return response.data || { applications: [], totalCount: 0, page: 1, totalPages: 1 };
    },
    staleTime: 1000 * 60 * 2,
    retry: getApplicationsRetryConfig,
  });
}

/**
 * Hook for fetching a specific therapist application by ID
 */
export function useTherapistApplication(applicationId: string | null) {
  const api = useApi();
  
  return useQuery({
    queryKey: ['therapists', 'applications', 'detail', applicationId || ''],
    queryFn: () => api.therapists.application.getById(applicationId!),
    enabled: !!applicationId,
    staleTime: 1000 * 60 * 5, // Application details are more stable
    retry: getApplicationDetailRetryConfig,
  });
}

/**
 * Hook for fetching the current user's therapist application
 */
export function useMyTherapistApplication() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['therapists', 'applications', 'detail', 'me'],
    queryFn: () => api.therapists.application.getMy(),
    staleTime: 1000 * 60 * 10, // My application doesn't change often
    retry: getApplicationDetailRetryConfig,
  });
}

/**
 * Hook for submitting a new therapist application
 */
export function useSubmitTherapistApplication() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateApplicationRequest) => 
      api.therapists.application.submit(data),
    onSuccess: (data) => {
      toast.success('Application submitted successfully!');
      
      // Invalidate and refetch my application
      queryClient.invalidateQueries({ 
        queryKey: ['therapists', 'applications', 'detail', 'me'] 
      });
      
      // Invalidate applications list for admin
      queryClient.invalidateQueries({ 
        queryKey: ['therapists', 'applications'] 
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to submit application');
    },
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
      data: UpdateApplicationRequest 
    }) => api.therapists.application.update(applicationId, data),
    onMutate: async ({ applicationId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ['therapists', 'applications', 'detail', applicationId] 
      });
      
      // Snapshot the previous value
      const previousApplication = queryClient.getQueryData(
        ['therapists', 'applications', 'detail', applicationId]
      );
      
      // Optimistically update to the new value
      queryClient.setQueryData(
        ['therapists', 'applications', 'detail', applicationId],
        (old: TherapistApplication | undefined) => 
          old ? { ...old, ...data, reviewedAt: new Date().toISOString() } : old
      );
      
      return { previousApplication, applicationId };
    },
    onError: (error: MentaraApiError, { applicationId }, context) => {
      // Rollback to previous value on error
      if (context?.previousApplication) {
        queryClient.setQueryData(
          ['therapists', 'applications', 'detail', applicationId],
          context.previousApplication
        );
      }
      toast.error(error?.message || 'Failed to update application status');
    },
    onSuccess: (data, { applicationId, data: updateData }) => {
      const statusText = updateData.status === 'approved' ? 'approved' : 
                        updateData.status === 'rejected' ? 'rejected' : 'updated';
      toast.success(`Application ${statusText} successfully!`);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['therapists', 'applications'] 
      });
      
      // If approved, also invalidate therapist-related queries
      if (updateData.status === 'approved') {
        queryClient.invalidateQueries({ 
          queryKey: ['therapists'] 
        });
      }
    },
    onSettled: () => {
      // Always refetch applications list
      queryClient.invalidateQueries({ 
        queryKey: ['therapists', 'applications'] 
      });
    },
  });
}

/**
 * Hook for bulk actions on therapist applications (admin functionality)
 */
export function useBulkUpdateApplications() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      applicationIds, 
      data 
    }: { 
      applicationIds: string[]; 
      data: UpdateApplicationRequest 
    }) => {
      // Execute updates in parallel
      const results = await Promise.allSettled(
        applicationIds.map(id => api.therapists.application.update(id, data))
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      return { successful, failed, total: applicationIds.length };
    },
    onSuccess: ({ successful, failed, total }) => {
      if (failed === 0) {
        toast.success(`Successfully updated ${successful} applications`);
      } else {
        toast.warning(`Updated ${successful} applications, ${failed} failed`);
      }
      
      // Invalidate all applications queries
      queryClient.invalidateQueries({ 
        queryKey: ['therapists', 'applications'] 
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Bulk update failed');
    },
  });
}

/**
 * Hook for prefetching application details
 */
export function usePrefetchTherapistApplication() {
  const queryClient = useQueryClient();
  const api = useApi();
  
  return (applicationId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['therapists', 'applications', 'detail', applicationId],
      queryFn: () => api.therapists.application.getById(applicationId),
      staleTime: 1000 * 60 * 5,
    });
  };
}