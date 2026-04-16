import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MeetingType } from "@/types/booking";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME, GC_TIME, REFETCH_INTERVAL } from "@/lib/constants/react-query";
import { toast } from "sonner";
import { MentaraApiError } from "@/lib/api/errorHandler";

interface BookingSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  therapistId: string;
}

interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  therapistId: string;
  clientId: string;
  meetingUrl?: string;
  notes?: string;
}

/**
 * Hook for managing therapy session bookings
 */
/**
 * Hook for managing therapy session bookings
 */
export function useBooking() {
  const api = useApi();
  const queryClient = useQueryClient();

  // Get available time slots
  const getAvailableSlots = (therapistId: string, date: string) => {
    return useQuery({
      queryKey: queryKeys.booking.slots(therapistId, date),
      queryFn: () => api.booking.availability.getSlots(therapistId, date),
      enabled: !!(therapistId && date),
      staleTime: STALE_TIME.MEDIUM, // 5 minutes
      gcTime: GC_TIME.MEDIUM, // 10 minutes
      refetchOnWindowFocus: false,
    });
  };

  // Get meeting durations
  const {
    data: durations,
    isLoading: isLoadingDurations,
  } = useQuery({
    queryKey: [...queryKeys.booking.all, 'durations'],
    queryFn: () => api.booking.durations.getAll(),
    staleTime: STALE_TIME.STATIC, // 30 minutes
    gcTime: GC_TIME.EXTENDED, // 1 hour
    refetchOnWindowFocus: false,
  });

  // Create meeting mutation (for clients)
  const createMeetingMutation = useMutation({
    mutationFn: ({ 
      therapistId, 
      startTime, 
      duration, 
      title,
      description,
      meetingType = MeetingType.VIDEO,
    }: { 
      therapistId: string; 
      startTime: string; 
      duration: number; 
      title?: string;
      description?: string;
      meetingType?: MeetingType;
    }) => api.booking.meetings.create({
      therapistId,
      startTime,
      duration,
      title: title || 'Therapy Session',
      description,
      meetingType,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.appointments() });
      toast.success("Session booked successfully");
    },
    onError: (error: MentaraApiError) => {
      toast.error(error.message || "Failed to book session");
    },
  });

  // Cancel meeting mutation
  const cancelMeetingMutation = useMutation({
    mutationFn: (meetingId: string) => api.booking.meetings.cancel(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.appointments() });
      toast.success("Meeting cancelled successfully");
    },
    onError: (error: MentaraApiError) => {
      toast.error(error.message || "Failed to cancel meeting");
    },
  });

  // Update meeting mutation
  const updateMeetingMutation = useMutation({
    mutationFn: ({ 
      meetingId, 
      updates,
    }: { 
      meetingId: string; 
      updates: {
        title?: string;
        description?: string;
        startTime?: string;
        duration?: number;
        meetingType?: MeetingType;
        status?: 'SCHEDULED' | 'WAITING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
      };
    }) => api.booking.meetings.update(meetingId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.appointments() });
      toast.success("Meeting updated successfully");
    },
    onError: (error: MentaraApiError) => {
      toast.error(error.message || "Failed to update meeting");
    },
  });

  // Accept meeting request mutation
  const acceptMeetingRequestMutation = useMutation({
    mutationFn: ({ meetingId, meetingUrl }: { meetingId: string; meetingUrl?: string }) => 
      api.meetings.acceptMeetingRequest(meetingId, meetingUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.appointments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
      toast.success("Booking request accepted successfully");
    },
    onError: (error: MentaraApiError) => {
      toast.error(error.message || "Failed to accept booking request");
    },
  });

  // Start meeting mutation
  const startMeetingMutation = useMutation({
    mutationFn: (meetingId: string) => api.meetings.startMeeting(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.appointments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
      toast.success("Meeting started successfully");
    },
    onError: (error: MentaraApiError) => {
      toast.error(error.message || "Failed to start meeting");
    },
  });

  // Complete meeting mutation
  const completeMeetingMutation = useMutation({
    mutationFn: ({ meetingId, notes }: { meetingId: string; notes?: string }) => 
      api.meetings.completeMeeting(meetingId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.appointments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
      toast.success("Meeting completed successfully");
    },
    onError: (error: MentaraApiError) => {
      toast.error(error.message || "Failed to complete meeting");
    },
  });

  // Mark no show mutation
  const markNoShowMutation = useMutation({
    mutationFn: (meetingId: string) => api.meetings.markNoShow(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.appointments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
      toast.success("Meeting marked as no-show");
    },
    onError: (error: MentaraApiError) => {
      toast.error(error.message || "Failed to mark meeting as no-show");
    },
  });

  // Save meeting notes mutation
  const saveMeetingNotesMutation = useMutation({
    mutationFn: ({ meetingId, notes }: { meetingId: string; notes: string }) => 
      api.meetings.saveMeetingNotes(meetingId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.appointments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
      toast.success("Meeting notes saved successfully");
    },
    onError: (error: MentaraApiError) => {
      toast.error(error.message || "Failed to save meeting notes");
    },
  });

  return {
    durations: durations || [],
    isLoadingDurations,
    getAvailableSlots,
    createMeeting: (data: {
      therapistId: string;
      startTime: string;
      duration: number;
      title?: string;
      description?: string;
      meetingType?: MeetingType;
    }) => createMeetingMutation.mutate(data),
    cancelMeeting: (meetingId: string) => cancelMeetingMutation.mutate(meetingId),
    updateMeeting: (meetingId: string, updates: any) => 
      updateMeetingMutation.mutate({ meetingId, updates }),
    
    // New meeting status transition methods
    acceptMeetingRequest: (meetingId: string, meetingUrl?: string) =>
      acceptMeetingRequestMutation.mutate({ meetingId, meetingUrl }),
    startMeeting: (meetingId: string) => startMeetingMutation.mutate(meetingId),
    completeMeeting: (meetingId: string, notes?: string) =>
      completeMeetingMutation.mutate({ meetingId, notes }),
    markNoShow: (meetingId: string) => markNoShowMutation.mutate(meetingId),
    saveMeetingNotes: (meetingId: string, notes: string) =>
      saveMeetingNotesMutation.mutate({ meetingId, notes }),
    
    // Loading states
    isCreating: createMeetingMutation.isPending,
    isCancelling: cancelMeetingMutation.isPending,
    isUpdating: updateMeetingMutation.isPending,
    isAcceptingRequest: acceptMeetingRequestMutation.isPending,
    isStarting: startMeetingMutation.isPending,
    isCompleting: completeMeetingMutation.isPending,
    isMarkingNoShow: markNoShowMutation.isPending,
    isSavingNotes: saveMeetingNotesMutation.isPending,
    
    // Legacy aliases for backward compatibility
    bookSession: (therapistId: string, startTime: string, duration: number, notes?: string) =>
      createMeetingMutation.mutate({ 
        therapistId, 
        startTime, 
        duration, 
        description: notes,
      }),
    rescheduleBooking: (meetingId: string, newStartTime: string, newDuration?: number) =>
      updateMeetingMutation.mutate({ 
        meetingId, 
        updates: { 
          startTime: newStartTime, 
          ...(newDuration && { duration: newDuration }),
        },
      }),
    isBooking: createMeetingMutation.isPending,
    isRescheduling: updateMeetingMutation.isPending,
  };
}

/**
 * Hook for getting user's meetings
 */
export function useMeetings(filters: { status?: string; limit?: number; offset?: number } = {}) {
  const api = useApi();

  const {
    data: meetings,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.booking.appointments(filters),
    queryFn: () => api.booking.meetings.getAll(filters),
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });

  return {
    meetings: meetings || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for managing booking requests (therapists only)
 */
export function useBookingRequests(limit?: number) {
  const api = useApi();
  const queryClient = useQueryClient();

  // Get booking requests (only WAITING status)
  const {
    data: bookingRequests,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...queryKeys.sessions.all, 'booking-requests', limit],
    queryFn: () => api.meetings.getAllMeetings({ status: 'WAITING', limit }),
    staleTime: STALE_TIME.VERY_SHORT, // 30 seconds (more frequent updates for pending requests)
    gcTime: GC_TIME.SHORT, // 5 minutes
    refetchInterval: REFETCH_INTERVAL.FREQUENT, // Auto-refresh every minute
    refetchOnWindowFocus: true, // Refetch on focus for booking requests
  });

  // Accept booking request mutation
  const acceptRequestMutation = useMutation({
    mutationFn: ({ meetingId, meetingUrl }: { meetingId: string; meetingUrl?: string }) => 
      api.meetings.acceptMeetingRequest(meetingId, meetingUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings', 'booking-requests'] });
      queryClient.invalidateQueries({ queryKey: ['booking', 'meetings'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
      toast.success("Booking request accepted successfully");
    },
    onError: (error: MentaraApiError) => {
      if (error.message.includes('conflicts')) {
        toast.error("Cannot accept booking: time slot conflicts with existing confirmed meeting");
      } else {
        toast.error(error.message || "Failed to accept booking request");
      }
    },
  });

  // Deny booking request mutation
  const denyRequestMutation = useMutation({
    mutationFn: ({ meetingId, reason }: { meetingId: string; reason?: string }) => 
      api.meetings.denyBookingRequest(meetingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings', 'booking-requests'] });
      queryClient.invalidateQueries({ queryKey: ['booking', 'meetings'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
      toast.success("Booking request denied");
    },
    onError: (error: MentaraApiError) => {
      toast.error(error.message || "Failed to deny booking request");
    },
  });

  return {
    bookingRequests: bookingRequests || [],
    isLoading,
    error,
    refetch,
    acceptRequest: (meetingId: string, meetingUrl?: string) => 
      acceptRequestMutation.mutate({ meetingId, meetingUrl }),
    denyRequest: (meetingId: string, reason?: string) => 
      denyRequestMutation.mutate({ meetingId, reason }),
    isAccepting: acceptRequestMutation.isPending,
    isDenying: denyRequestMutation.isPending,
  };
}

/**
 * Hook for getting therapist analytics
 */
export function useTherapistAnalytics(dateRange?: { start: string; end: string }) {
  const api = useApi();

  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...queryKeys.therapist.all, 'analytics', dateRange?.start, dateRange?.end],
    queryFn: () => api.meetings.getTherapistAnalytics(dateRange?.start, dateRange?.end),
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });

  return {
    analytics,
    isLoading,
    error,
    refetch,
  };
}