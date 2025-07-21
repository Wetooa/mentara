import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';

import { toast } from 'sonner';
import { MentaraApiError } from '@/lib/api/errorHandler';
import type { TherapistDashboardData } from 'mentara-commons';

// TODO: Add MeetingData to mentara-commons or define locally
interface MeetingData {
  id: string;
  status: 'scheduled' | 'started' | 'completed' | 'cancelled';
  [key: string]: any;
}

/**
 * Hook for fetching complete therapist dashboard data
 */
export function useTherapistDashboard() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['therapists', 'dashboard'],
    queryFn: () => api.therapists.dashboard.getData(),
    staleTime: 1000 * 60 * 2, // Consider fresh for 2 minutes (dashboard data changes frequently)
    retry: (failureCount, error: MentaraApiError) => {
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
    queryKey: ['therapists', 'dashboard', 'stats'],
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
    queryKey: ['therapists', 'dashboard', 'appointments'],
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
    queryKey: ['therapists', 'meetings', params],
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
    queryKey: ['therapists', 'meetings', meetingId || ''],
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
    mutationFn: (meetingId: string) => api.therapists.meetings.start(meetingId),
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
      queryFn: () => api.therapists.meetings.getById(meetingId),
      staleTime: 1000 * 60 * 5,
    });
  };
}