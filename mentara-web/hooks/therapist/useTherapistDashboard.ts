import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME, GC_TIME, REFETCH_INTERVAL } from "@/lib/constants/react-query";
import { toast } from "sonner";
import { MentaraApiError } from "@/lib/api/errorHandler";
import { logger } from "@/lib/logger";
import type { Meeting } from "@/types/api/meetings";

// Use Meeting type from local API types
type MeetingData = Meeting;

/**
 * Hook for fetching complete therapist dashboard data
 */
export function useTherapistDashboard() {
  const api = useApi();

  return useQuery({
    queryKey: queryKeys.therapist.dashboard(),
    queryFn: () => api.dashboard.getTherapistDashboard(),
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false, // Don't refetch dashboard on focus
    retry: (failureCount, error: MentaraApiError) => {
      logger.debug(
        `🔄 [useTherapistDashboard] Retry attempt ${failureCount + 1} for error:`,
        error
      );

      // Don't retry authentication errors
      if (error?.status === 401) {
        logger.debug(`❌ [useTherapistDashboard] Authentication error - no retry`);
        return false;
      }

      // Don't retry authorization errors (user doesn't have therapist access)
      if (error?.status === 403) {
        logger.debug(`❌ [useTherapistDashboard] Authorization error - no retry`);
        return false;
      }

      // Don't retry therapist data consistency errors (404 with specific message)
      if (
        error?.status === 404 &&
        error?.message?.includes("Therapist record not found")
      ) {
        logger.debug(`❌ [useTherapistDashboard] Data consistency error - no retry`);
        return false;
      }

      // Don't retry client errors (400-499) except for temporary issues
      if (error?.status >= 400 && error?.status < 500) {
        // Retry rate limiting and temporary client errors
        if (error?.status === 429 || error?.status === 408) {
          return failureCount < 2; // Limited retries for rate limiting
        }
        logger.debug(`❌ [useTherapistDashboard] Client error ${error.status} - no retry`);
        return false;
      }

      // Retry server errors (500+) and network errors
      if (error?.status >= 500 || error?.status === 0) {
        logger.debug(
          `🔄 [useTherapistDashboard] Server/network error - retry ${failureCount + 1}/3`
        );
        return failureCount < 3;
      }

      // Default: retry up to 2 times for unknown errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.min(1000 * 2 ** attemptIndex, 4000);
      logger.debug(`⏱️ [useTherapistDashboard] Retry delay: ${delay}ms`);
      return delay;
    },
    onError: (error: MentaraApiError) => {
      logger.error(
        `❌ [useTherapistDashboard] Dashboard fetch failed:`,
        error
      );

      // Enhanced error logging for debugging
      logger.error(`❌ [useTherapistDashboard] Error details:`, {
        status: error.status,
        code: error.code,
        message: error.message,
        details: error.details,
      });

      // Show user-friendly error messages based on error type
      if (error.status === 401) {
        toast.error("Please log in again to access your dashboard");
      } else if (error.status === 403) {
        if (error.message?.includes("not have therapist role")) {
          toast.error(
            "Access denied: You need a therapist account to access this dashboard"
          );
        } else if (error.message?.includes("not active")) {
          toast.error(
            "Your account is currently inactive. Please contact support."
          );
        } else {
          toast.error(
            "Access denied: You are not authorized to access the therapist dashboard"
          );
        }
      } else if (
        error.status === 404 &&
        error.message?.includes("Therapist record not found")
      ) {
        // This is the specific error we're fixing - show helpful message
        toast.error(
          "Dashboard access issue: Your therapist profile needs to be set up. Please contact support.",
          { duration: 8000 } // Longer duration for important message
        );
      } else if (error.status === 404) {
        toast.error("Dashboard service temporarily unavailable");
      } else if (error.status === 429) {
        toast.error("Too many requests. Please wait a moment and try again.");
      } else if (error.status >= 500) {
        toast.error(
          "Server error: Unable to load dashboard. Please try again later."
        );
      } else if (error.status === 0) {
        toast.error(
          "Network error: Please check your connection and try again."
        );
      } else {
        // Fallback for unknown errors
        const errorMessage = error.message || "An unexpected error occurred";
        toast.error(`Dashboard error: ${errorMessage}`);
      }
    },
    onSuccess: (data) => {
      logger.debug(`✅ [useTherapistDashboard] Dashboard data loaded successfully`);
      // Clear any previous error states on successful load
    },
    meta: {
      // Metadata for error tracking and analytics
      errorContext: "therapist_dashboard",
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
    queryKey: queryKeys.therapist.stats(),
    queryFn: () => api.dashboard.getTherapistMetrics(),
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching upcoming appointments
 */
export function useTherapistUpcomingAppointments() {
  const api = useApi();

  return useQuery({
    queryKey: queryKeys.therapist.appointments(),
    queryFn: () => api.meetings.getUpcomingMeetings(10),
    staleTime: STALE_TIME.SHORT, // 1 minute
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchInterval: REFETCH_INTERVAL.MODERATE, // Auto-refresh every 5 minutes
    refetchOnWindowFocus: true, // Refetch appointments on focus
  });
}

/**
 * Hook for getting therapist meetings/sessions
 */
export function useTherapistMeetings(
  params: {
    status?: string;
    limit?: number;
    offset?: number;
  } = {}
) {
  const api = useApi();

  return useQuery({
    queryKey: queryKeys.therapist.meetings(params),
    queryFn: () => api.booking.meetings.getAll(params),
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for getting a specific meeting
 */
export function useTherapistMeeting(meetingId: string | null) {
  const api = useApi();

  return useQuery({
    queryKey: queryKeys.therapist.meeting(meetingId || ""),
    queryFn: () => api.meetings.getById(meetingId!),
    enabled: !!meetingId,
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
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
      status,
    }: {
      meetingId: string;
      status: "scheduled" | "started" | "completed" | "cancelled";
    }) => api.meetings.updateMeetingStatus(meetingId, status),
    onMutate: async ({ meetingId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.therapist.meetings(),
      });

      // Optimistically update meeting status
      queryClient.setQueriesData(
        { queryKey: queryKeys.therapist.meetings() },
        (oldData: MeetingData[] | undefined) => {
          if (Array.isArray(oldData)) {
            return oldData.map((meeting) =>
              meeting.id === meetingId ? { ...meeting, status } : meeting
            );
          }
          return oldData;
        }
      );

      // Also update specific meeting query
      queryClient.setQueryData(
        queryKeys.therapist.meeting(meetingId),
        (oldMeeting: MeetingData | undefined) =>
          oldMeeting ? { ...oldMeeting, status } : oldMeeting
      );
    },
    onError: (error: MentaraApiError, { meetingId }) => {
      toast.error(error?.message || "Failed to update meeting status");

      // Invalidate queries to revert optimistic update
      queryClient.invalidateQueries({
        queryKey: queryKeys.therapist.meetings(),
      });
    },
    onSuccess: (data, { status }) => {
      const statusText =
        status === "started"
          ? "started"
          : status === "completed"
            ? "completed"
            : status === "cancelled"
              ? "cancelled"
              : "updated";
      toast.success(`Meeting ${statusText} successfully!`);

      // Invalidate dashboard data to refresh stats
      queryClient.invalidateQueries({
        queryKey: queryKeys.therapist.dashboard(),
      });
    },
    onSettled: () => {
      // Always refetch meetings
      queryClient.invalidateQueries({
        queryKey: queryKeys.therapist.meetings(),
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
      toast.success("Meeting started successfully!");

      // Update meeting status to 'started'
      queryClient.setQueriesData(
        { queryKey: queryKeys.therapist.meetings() },
        (oldData: MeetingData[] | undefined) => {
          if (Array.isArray(oldData)) {
            return oldData.map((meeting) =>
              meeting.id === meetingId
                ? { ...meeting, status: "started" }
                : meeting
            );
          }
          return oldData;
        }
      );

      // Invalidate dashboard
      queryClient.invalidateQueries({
        queryKey: queryKeys.therapist.dashboard(),
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || "Failed to start meeting");
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
      queryKey: queryKeys.therapist.dashboard(),
    });

    queryClient.invalidateQueries({
      queryKey: queryKeys.therapist.meetings(),
    });

    toast.success("Dashboard refreshed!");
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
      queryKey: queryKeys.therapist.meeting(meetingId),
      queryFn: () => api.meetings.getById(meetingId),
      staleTime: STALE_TIME.MEDIUM, // 5 minutes
      gcTime: GC_TIME.MEDIUM, // 10 minutes
    });
  };
}
