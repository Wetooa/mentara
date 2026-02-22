import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { MentaraApiError } from '@/lib/api/errorHandler';
import { queryKeys } from '@/lib/queryKeys';
import { STALE_TIME, GC_TIME, REFETCH_INTERVAL } from '@/lib/constants/react-query';
import type { Meeting, MeetingsQueryOptions } from '@/lib/api/services/meetings';

/**
 * Hook for fetching all sessions with filtering options
 */
export function useSessions(options: MeetingsQueryOptions = {}) {
  const api = useApi();

  return useQuery({
    queryKey: queryKeys.sessions.list(options),
    queryFn: () => api.meetings.getAllMeetings(options),
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
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
    queryKey: queryKeys.sessions.upcoming(limit),
    queryFn: () => api.meetings.getUpcomingMeetings(limit),
    staleTime: STALE_TIME.VERY_SHORT, // 30 seconds (sessions change frequently)
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchInterval: REFETCH_INTERVAL.MODERATE, // Auto-refresh every 5 minutes
    refetchOnWindowFocus: true, // Refetch on focus for upcoming sessions
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
    queryKey: queryKeys.sessions.completed(limit),
    queryFn: () => api.meetings.getCompletedMeetings(limit),
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
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
    queryKey: queryKeys.sessions.cancelled(limit),
    queryFn: () => api.meetings.getCancelledMeetings(limit),
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
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
    queryKey: queryKeys.sessions.inProgress(limit),
    queryFn: () => api.meetings.getInProgressMeetings(limit),
    staleTime: STALE_TIME.VERY_SHORT, // 30 seconds (in-progress sessions change very frequently)
    gcTime: GC_TIME.SHORT, // 5 minutes
    refetchInterval: REFETCH_INTERVAL.FREQUENT, // Auto-refresh every 1 minute (approximate to 2 minutes)
    refetchOnWindowFocus: true, // Refetch on focus for in-progress sessions
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
    queryKey: queryKeys.sessions.byStatus(status, limit),
    queryFn: () => api.meetings.getMeetingsByStatus(status, limit),
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
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
    queryKey: queryKeys.sessions.dateRange(dateFrom, dateTo, limit),
    queryFn: () => api.meetings.getMeetingsInDateRange(dateFrom, dateTo, limit),
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
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
    queryKey: queryKeys.sessions.byId(sessionId),
    queryFn: () => api.meetings.getMeetingById(sessionId),
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
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
    queryKey: queryKeys.sessions.stats(),
    queryFn: async () => {
      // Fetch different session counts in parallel
      const [upcoming, completed, cancelled, inProgress] = await Promise.all([
        api.meetings.getUpcomingMeetings(1).then(meetings => meetings.meetings.length),
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
    staleTime: STALE_TIME.SHORT, // 2-3 minutes (using SHORT as approximation)
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
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
        queryKey: queryKeys.sessions.upcoming(limit),
        queryFn: () => api.meetings.getUpcomingMeetings(limit),
        staleTime: STALE_TIME.SHORT,
        gcTime: GC_TIME.MEDIUM,
      });
    },
    prefetchCompleted: (limit = 10) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.sessions.completed(limit),
        queryFn: () => api.meetings.getCompletedMeetings(limit),
        staleTime: STALE_TIME.MEDIUM,
        gcTime: GC_TIME.MEDIUM,
      });
    },
    prefetchCancelled: (limit = 10) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.sessions.cancelled(limit),
        queryFn: () => api.meetings.getCancelledMeetings(limit),
        staleTime: STALE_TIME.MEDIUM,
        gcTime: GC_TIME.MEDIUM,
      });
    },
    prefetchInProgress: (limit = 10) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.sessions.inProgress(limit),
        queryFn: () => api.meetings.getInProgressMeetings(limit),
        staleTime: STALE_TIME.VERY_SHORT,
        gcTime: GC_TIME.SHORT,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
    invalidateUpcoming: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.upcoming() });
    },
    invalidateCompleted: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.completed() });
    },
    invalidateCancelled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.cancelled() });
    },
    invalidateInProgress: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.inProgress() });
    },
    invalidateStats: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.stats() });
    },
  };
}
