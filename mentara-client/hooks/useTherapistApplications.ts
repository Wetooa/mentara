import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { queryKeys, getRelatedQueryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';
import type { 
  TherapistApplication,
  ApplicationListParams,
  UpdateApplicationRequest,
  CreateApplicationRequest
} from '@/lib/api/services/therapists';

/**
 * Hook for fetching therapist applications list (admin functionality)
 */
export function useTherapistApplications(params: ApplicationListParams = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.therapists.applications.list(params),
    queryFn: () => api.therapists.application.getList(params),
    staleTime: 1000 * 60 * 2, // Consider fresh for 2 minutes (admin data changes frequently)
  });
}

/**
 * Hook for fetching a specific therapist application by ID
 */
export function useTherapistApplication(applicationId: string | null) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.therapists.applications.detail(applicationId || ''),
    queryFn: () => api.therapists.application.getById(applicationId!),
    enabled: !!applicationId,
    staleTime: 1000 * 60 * 5, // Application details are more stable
  });
}

/**
 * Hook for fetching the current user's therapist application
 */
export function useMyTherapistApplication() {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.therapists.applications.detail('me'),
    queryFn: () => api.therapists.application.getMy(),
    staleTime: 1000 * 60 * 10, // My application doesn't change often
    retry: (failureCount, error: any) => {
      // Don't retry if application doesn't exist (404)
      if (error?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
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
        queryKey: queryKeys.therapists.applications.detail('me') 
      });
      
      // Invalidate applications list for admin
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.therapists.applications.all 
      });
    },
    onError: (error: any) => {
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
        queryKey: queryKeys.therapists.applications.detail(applicationId) 
      });
      
      // Snapshot the previous value
      const previousApplication = queryClient.getQueryData(
        queryKeys.therapists.applications.detail(applicationId)
      );
      
      // Optimistically update to the new value
      queryClient.setQueryData(
        queryKeys.therapists.applications.detail(applicationId),
        (old: TherapistApplication | undefined) => 
          old ? { ...old, ...data, reviewedAt: new Date().toISOString() } : old
      );
      
      return { previousApplication, applicationId };
    },
    onError: (error: any, { applicationId }, context) => {
      // Rollback to previous value on error
      if (context?.previousApplication) {
        queryClient.setQueryData(
          queryKeys.therapists.applications.detail(applicationId),
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
        queryKey: queryKeys.therapists.applications.all 
      });
      
      // If approved, also invalidate therapist-related queries
      if (updateData.status === 'approved') {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.therapists.all 
        });
      }
    },
    onSettled: () => {
      // Always refetch applications list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.therapists.applications.all 
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
        queryKey: queryKeys.therapists.applications.all 
      });
    },
    onError: (error: any) => {
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
      queryKey: queryKeys.therapists.applications.detail(applicationId),
      queryFn: () => api.therapists.application.getById(applicationId),
      staleTime: 1000 * 60 * 5,
    });
  };
}