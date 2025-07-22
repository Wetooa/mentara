import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { MentaraApiError } from '@/lib/api/errorHandler';
import type { Meeting, MeetingsQueryOptions } from '@/lib/api/services/meetings';

/**
 * Hook for fetching all sessions with filtering options
 */
export function useSessions(options: MeetingsQueryOptions = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: ['sessions', 'all', options],
    queryFn: () => api.meetings.getAllMeetings(options),
    staleTime: 1000 * 60 * 2, // Consider fresh for 2 minutes
    retry: (failureCount, error: MentaraApiError) => {
      // Don't retry if not authorized
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for fetching upcoming sessions
 */
export function useUpcomingSessions(limit = 10) {
  const api = useApi();
  
  return useQuery({
    queryKey: ['sessions', 'upcoming', limit],
    queryFn: () => api.meetings.getUpcomingMeetings(limit),
    staleTime: 1000 * 60 * 1, // Sessions change frequently, refresh every minute
    refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 minutes
    retry: (failureCount, error: MentaraApiError) => {
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for fetching completed sessions
 */
export function useCompletedSessions(limit = 10) {
  const api = useApi();
  
  return useQuery({
    queryKey: ['sessions', 'completed', limit],
    queryFn: () => api.meetings.getCompletedMeetings(limit),
    staleTime: 1000 * 60 * 5, // Completed sessions don't change often
    retry: (failureCount, error: MentaraApiError) => {
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for fetching cancelled sessions
 */
export function useCancelledSessions(limit = 10) {
  const api = useApi();
  
  return useQuery({
    queryKey: ['sessions', 'cancelled', limit],
    queryFn: () => api.meetings.getCancelledMeetings(limit),
    staleTime: 1000 * 60 * 5, // Cancelled sessions don't change often
    retry: (failureCount, error: MentaraApiError) => {
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for fetching in-progress sessions
 */
export function useInProgressSessions(limit = 10) {
  const api = useApi();
  
  return useQuery({
    queryKey: ['sessions', 'in-progress', limit],
    queryFn: () => api.meetings.getInProgressMeetings(limit),
    staleTime: 1000 * 30, // In-progress sessions change very frequently
    refetchInterval: 1000 * 60 * 2, // Auto-refresh every 2 minutes
    retry: (failureCount, error: MentaraApiError) => {
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for fetching sessions by status
 */
export function useSessionsByStatus(status: Meeting["status"], limit = 10) {
  const api = useApi();
  
  return useQuery({
    queryKey: ['sessions', 'by-status', status, limit],
    queryFn: () => api.meetings.getMeetingsByStatus(status, limit),
    staleTime: 1000 * 60 * 2,
    enabled: !!status,
    retry: (failureCount, error: MentaraApiError) => {
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for fetching sessions within a date range
 */
export function useSessionsInDateRange(dateFrom: string, dateTo: string, limit = 20) {
  const api = useApi();
  
  return useQuery({
    queryKey: ['sessions', 'date-range', dateFrom, dateTo, limit],
    queryFn: () => api.meetings.getMeetingsInDateRange(dateFrom, dateTo, limit),
    staleTime: 1000 * 60 * 5,
    enabled: !!dateFrom && !!dateTo,
    retry: (failureCount, error: MentaraApiError) => {
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for fetching a single session by ID
 */
export function useSessionById(sessionId: string) {
  const api = useApi();
  
  return useQuery({
    queryKey: ['sessions', 'by-id', sessionId],
    queryFn: () => api.meetings.getMeetingById(sessionId),
    staleTime: 1000 * 60 * 2, // Consider fresh for 2 minutes
    enabled: !!sessionId,
    retry: (failureCount, error: MentaraApiError) => {
      // Don't retry if not found or not authorized
      if (error?.status === 404 || error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for getting session statistics
 */
export function useSessionStats() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['sessions', 'stats'],
    queryFn: async () => {
      // Fetch different session counts in parallel
      const [upcoming, completed, cancelled, inProgress] = await Promise.all([
        api.meetings.getUpcomingMeetings(1).then(meetings => meetings.length),
        api.meetings.getCompletedMeetings(100).then(meetings => meetings.length), 
        api.meetings.getCancelledMeetings(100).then(meetings => meetings.length),
        api.meetings.getInProgressMeetings(1).then(meetings => meetings.length),
      ]);
      
      return {
        upcoming,
        completed, 
        cancelled,
        inProgress,
        total: upcoming + completed + cancelled + inProgress,
      };
    },
    staleTime: 1000 * 60 * 3, // Stats can be cached for 3 minutes
    retry: (failureCount, error: MentaraApiError) => {
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for prefetching sessions (useful for navigation)
 */
export function usePrefetchSessions() {
  const queryClient = useQueryClient();
  const api = useApi();
  
  return {
    prefetchUpcoming: (limit = 10) => {
      queryClient.prefetchQuery({
        queryKey: ['sessions', 'upcoming', limit],
        queryFn: () => api.meetings.getUpcomingMeetings(limit),
        staleTime: 1000 * 60 * 2,
      });
    },
    prefetchCompleted: (limit = 10) => {
      queryClient.prefetchQuery({
        queryKey: ['sessions', 'completed', limit],
        queryFn: () => api.meetings.getCompletedMeetings(limit),
        staleTime: 1000 * 60 * 5,
      });
    },
    prefetchCancelled: (limit = 10) => {
      queryClient.prefetchQuery({
        queryKey: ['sessions', 'cancelled', limit], 
        queryFn: () => api.meetings.getCancelledMeetings(limit),
        staleTime: 1000 * 60 * 5,
      });
    },
    prefetchInProgress: (limit = 10) => {
      queryClient.prefetchQuery({
        queryKey: ['sessions', 'in-progress', limit],
        queryFn: () => api.meetings.getInProgressMeetings(limit),
        staleTime: 1000 * 30,
      });
    },
  };
}

/**
 * Hook for invalidating session queries (useful after mutations)
 */
export function useInvalidateSessions() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    invalidateUpcoming: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', 'upcoming'] });
    },
    invalidateCompleted: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', 'completed'] });
    },
    invalidateCancelled: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', 'cancelled'] });
    },
    invalidateInProgress: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', 'in-progress'] });
    },
    invalidateStats: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', 'stats'] });
    },
  };
}