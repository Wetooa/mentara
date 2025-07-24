import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';

import { toast } from 'sonner';
import { MentaraApiError } from '@/lib/api/errorHandler';

import type { Meeting } from "@/types/api/meetings";

// Use Meeting type from local API types
type MeetingData = Meeting;

/**
 * Hook for fetching complete therapist dashboard data
 */
export function useTherapistDashboard() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['therapists', 'dashboard'],
    queryFn: () => api.dashboard.getTherapistDashboard(),
    staleTime: 1000 * 60 * 2, // Consider fresh for 2 minutes (dashboard data changes frequently)
    retry: (failureCount, error: MentaraApiError) => {
      console.log(`🔄 [useTherapistDashboard] Retry attempt ${failureCount + 1} for error:`, error);
      
      // Don't retry authentication errors
      if (error?.status === 401) {
        console.log(`❌ [useTherapistDashboard] Authentication error - no retry`);
        return false;
      }
      
      // Don't retry authorization errors (user doesn't have therapist access)
      if (error?.status === 403) {
        console.log(`❌ [useTherapistDashboard] Authorization error - no retry`);
        return false;
      }
      
      // Don't retry therapist data consistency errors (404 with specific message)
      if (error?.status === 404 && error?.message?.includes('Therapist record not found')) {
        console.log(`❌ [useTherapistDashboard] Data consistency error - no retry`);
        return false;
      }
      
      // Don't retry client errors (400-499) except for temporary issues
      if (error?.status >= 400 && error?.status < 500) {
        // Retry rate limiting and temporary client errors
        if (error?.status === 429 || error?.status === 408) {
          return failureCount < 2; // Limited retries for rate limiting
        }
        console.log(`❌ [useTherapistDashboard] Client error ${error.status} - no retry`);
        return false;
      }
      
      // Retry server errors (500+) and network errors
      if (error?.status >= 500 || error?.status === 0) {
        console.log(`🔄 [useTherapistDashboard] Server/network error - retry ${failureCount + 1}/3`);
        return failureCount < 3;
      }
      
      // Default: retry up to 2 times for unknown errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.min(1000 * (2 ** attemptIndex), 4000);
      console.log(`⏱️ [useTherapistDashboard] Retry delay: ${delay}ms`);
      return delay;
    },
    onError: (error: MentaraApiError) => {
      console.error(`❌ [useTherapistDashboard] Dashboard fetch failed:`, error);
      
      // Enhanced error logging for debugging
      console.error(`❌ [useTherapistDashboard] Error details:`, {
        status: error.status,
        code: error.code,
        message: error.message,
        details: error.details,
      });
      
      // Show user-friendly error messages based on error type
      if (error.status === 401) {
        toast.error('Please log in again to access your dashboard');
      } else if (error.status === 403) {
        if (error.message?.includes('not have therapist role')) {
          toast.error('Access denied: You need a therapist account to access this dashboard');
        } else if (error.message?.includes('not active')) {
          toast.error('Your account is currently inactive. Please contact support.');
        } else {
          toast.error('Access denied: You are not authorized to access the therapist dashboard');
        }
      } else if (error.status === 404 && error.message?.includes('Therapist record not found')) {
        // This is the specific error we're fixing - show helpful message
        toast.error(
          'Dashboard access issue: Your therapist profile needs to be set up. Please contact support.',
          { duration: 8000 } // Longer duration for important message
        );
      } else if (error.status === 404) {
        toast.error('Dashboard service temporarily unavailable');
      } else if (error.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else if (error.status >= 500) {
        toast.error('Server error: Unable to load dashboard. Please try again later.');
      } else if (error.status === 0) {
        toast.error('Network error: Please check your connection and try again.');
      } else {
        // Fallback for unknown errors
        const errorMessage = error.message || 'An unexpected error occurred';
        toast.error(`Dashboard error: ${errorMessage}`);
      }
    },
    onSuccess: (data) => {
      console.log(`✅ [useTherapistDashboard] Dashboard data loaded successfully`);
      // Clear any previous error states on successful load
    },
    meta: {
      // Metadata for error tracking and analytics
      errorContext: 'therapist_dashboard',
      userFacing: true,
      criticalPath: true,
    } as any,
  });
}

/**
 * Hook for fetching therapist dashboard statistics only
 */
export function useTherapistStats() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['therapists', 'dashboard', 'stats'],
    queryFn: () => api.dashboard.getTherapistMetrics(),
    staleTime: 1000 * 60 * 5, // Stats change less frequently
  });
}

/**
 * Hook for fetching upcoming appointments
 */
export function useTherapistUpcomingAppointments() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['therapists', 'dashboard', 'appointments'],
    queryFn: () => api.meetings.getUpcomingMeetings(10),
    staleTime: 1000 * 60 * 1, // Appointments change frequently, refresh every minute
    refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 minutes
  });
}

/**
 * Hook for getting therapist meetings/sessions
 */
export function useTherapistMeetings(params: { 
  status?: string; 
  limit?: number; 
  offset?: number 
} = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: ['therapists', 'meetings', params],
    queryFn: () => api.booking.meetings.getAll(params),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook for getting a specific meeting
 */
export function useTherapistMeeting(meetingId: string | null) {
  const api = useApi();
  
  return useQuery({
    queryKey: ['therapists', 'meetings', meetingId || ''],
    queryFn: () => api.meetings.getById(meetingId!),
    enabled: !!meetingId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook for updating meeting status
 */
export function useUpdateMeetingStatus() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      meetingId, 
      status 
    }: { 
      meetingId: string; 
      status: 'scheduled' | 'started' | 'completed' | 'cancelled' 
    }) => api.meetings.updateMeetingStatus(meetingId, status),
    onMutate: async ({ meetingId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ['therapists', 'meetings'] 
      });
      
      // Optimistically update meeting status
      queryClient.setQueriesData(
        { queryKey: ['therapists', 'meetings'] },
        (oldData: MeetingData[] | undefined) => {
          if (Array.isArray(oldData)) {
            return oldData.map(meeting => 
              meeting.id === meetingId ? { ...meeting, status } : meeting
            );
          }
          return oldData;
        }
      );
      
      // Also update specific meeting query
      queryClient.setQueryData(
        ['therapists', 'meetings', meetingId],
        (oldMeeting: MeetingData | undefined) => oldMeeting ? { ...oldMeeting, status } : oldMeeting
      );
    },
    onError: (error: MentaraApiError, { meetingId }) => {
      toast.error(error?.message || 'Failed to update meeting status');
      
      // Invalidate queries to revert optimistic update
      queryClient.invalidateQueries({ 
        queryKey: ['therapists', 'meetings'] 
      });
    },
    onSuccess: (data, { status }) => {
      const statusText = status === 'started' ? 'started' : 
                        status === 'completed' ? 'completed' : 
                        status === 'cancelled' ? 'cancelled' : 'updated';
      toast.success(`Meeting ${statusText} successfully!`);
      
      // Invalidate dashboard data to refresh stats
      queryClient.invalidateQueries({ 
        queryKey: ['therapists', 'dashboard'] 
      });
    },
    onSettled: () => {
      // Always refetch meetings
      queryClient.invalidateQueries({ 
        queryKey: ['therapists', 'meetings'] 
      });
    },
  });
}

/**
 * Hook for starting a meeting (generates meeting URL)
 */
export function useStartMeeting() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (meetingId: string) => api.meetings.start(meetingId),
    onSuccess: (data, meetingId) => {
      toast.success('Meeting started successfully!');
      
      // Update meeting status to 'started'
      queryClient.setQueriesData(
        { queryKey: ['therapists', 'meetings'] },
        (oldData: MeetingData[] | undefined) => {
          if (Array.isArray(oldData)) {
            return oldData.map(meeting => 
              meeting.id === meetingId ? { ...meeting, status: 'started' } : meeting
            );
          }
          return oldData;
        }
      );
      
      // Invalidate dashboard
      queryClient.invalidateQueries({ 
        queryKey: ['therapists', 'dashboard'] 
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || 'Failed to start meeting');
    },
  });
}

/**
 * Hook for refreshing dashboard data manually
 */
export function useRefreshDashboard() {
  const queryClient = useQueryClient();
  
  return () => {
    // Invalidate all dashboard-related queries
    queryClient.invalidateQueries({ 
      queryKey: ['therapists', 'dashboard'] 
    });
    
    queryClient.invalidateQueries({ 
      queryKey: ['therapists', 'meetings'] 
    });
    
    toast.success('Dashboard refreshed!');
  };
}

/**
 * Hook for prefetching meeting details (for hover states, etc.)
 */
export function usePrefetchMeeting() {
  const queryClient = useQueryClient();
  const api = useApi();
  
  return (meetingId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['therapists', 'meetings', meetingId],
      queryFn: () => api.meetings.getById(meetingId),
      staleTime: 1000 * 60 * 5,
    });
  };
}