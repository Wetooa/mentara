import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';
import type { TherapistDashboardData } from '@/lib/api/services/therapists';

/**
 * Hook for fetching complete therapist dashboard data
 */
export function useTherapistDashboard() {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.therapists.all.concat(['dashboard']),
    queryFn: () => api.therapists.dashboard.getData(),
    staleTime: 1000 * 60 * 2, // Consider fresh for 2 minutes (dashboard data changes frequently)
    retry: (failureCount, error: any) => {
      // Don't retry if not authorized to access therapist data
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for fetching therapist dashboard statistics only
 */
export function useTherapistStats() {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.therapists.all.concat(['dashboard', 'stats']),
    queryFn: () => api.therapists.dashboard.getStats(),
    staleTime: 1000 * 60 * 5, // Stats change less frequently
  });
}

/**
 * Hook for fetching upcoming appointments
 */
export function useTherapistUpcomingAppointments() {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.therapists.all.concat(['dashboard', 'appointments']),
    queryFn: () => api.therapists.dashboard.getUpcomingAppointments(),
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
    queryKey: queryKeys.therapists.all.concat(['meetings', params]),
    queryFn: () => api.therapists.meetings.getList(params),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook for getting a specific meeting
 */
export function useTherapistMeeting(meetingId: string | null) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.therapists.all.concat(['meetings', meetingId || '']),
    queryFn: () => api.therapists.meetings.getById(meetingId!),
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
    }) => api.therapists.meetings.updateStatus(meetingId, status),
    onMutate: async ({ meetingId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.therapists.all.concat(['meetings']) 
      });
      
      // Optimistically update meeting status
      queryClient.setQueriesData(
        { queryKey: queryKeys.therapists.all.concat(['meetings']) },
        (oldData: any) => {
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
        queryKeys.therapists.all.concat(['meetings', meetingId]),
        (oldMeeting: any) => oldMeeting ? { ...oldMeeting, status } : oldMeeting
      );
    },
    onError: (error: any, { meetingId }) => {
      toast.error(error?.message || 'Failed to update meeting status');
      
      // Invalidate queries to revert optimistic update
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.therapists.all.concat(['meetings']) 
      });
    },
    onSuccess: (data, { status }) => {
      const statusText = status === 'started' ? 'started' : 
                        status === 'completed' ? 'completed' : 
                        status === 'cancelled' ? 'cancelled' : 'updated';
      toast.success(`Meeting ${statusText} successfully!`);
      
      // Invalidate dashboard data to refresh stats
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.therapists.all.concat(['dashboard']) 
      });
    },
    onSettled: () => {
      // Always refetch meetings
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.therapists.all.concat(['meetings']) 
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
    mutationFn: (meetingId: string) => api.therapists.meetings.start(meetingId),
    onSuccess: (data, meetingId) => {
      toast.success('Meeting started successfully!');
      
      // Update meeting status to 'started'
      queryClient.setQueriesData(
        { queryKey: queryKeys.therapists.all.concat(['meetings']) },
        (oldData: any) => {
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
        queryKey: queryKeys.therapists.all.concat(['dashboard']) 
      });
    },
    onError: (error: any) => {
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
      queryKey: queryKeys.therapists.all.concat(['dashboard']) 
    });
    
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.therapists.all.concat(['meetings']) 
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
      queryKey: queryKeys.therapists.all.concat(['meetings', meetingId]),
      queryFn: () => api.therapists.meetings.getById(meetingId),
      staleTime: 1000 * 60 * 5,
    });
  };
}