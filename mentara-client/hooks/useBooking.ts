import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";

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
export function useBooking() {
  const api = useApi();
  const queryClient = useQueryClient();

  // Get available time slots
  const getAvailableSlots = (therapistId: string, date: string) => {
    return useQuery({
      queryKey: queryKeys.booking.slots(therapistId, date),
      queryFn: () => api.booking.getAvailableSlots(therapistId, date),
      enabled: !!(therapistId && date),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  // Get meeting durations
  const {
    data: durations,
    isLoading: isLoadingDurations,
  } = useQuery({
    queryKey: queryKeys.booking.durations(),
    queryFn: () => api.booking.getDurations(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Book session mutation
  const bookSessionMutation = useMutation({
    mutationFn: ({ 
      therapistId, 
      startTime, 
      duration, 
      notes 
    }: { 
      therapistId: string; 
      startTime: string; 
      duration: number; 
      notes?: string; 
    }) => api.booking.bookSession(therapistId, startTime, duration, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.meetings.all() });
      toast.success("Session booked successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to book session");
    },
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: (meetingId: string) => api.booking.cancelBooking(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.meetings.all() });
      toast.success("Booking cancelled successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to cancel booking");
    },
  });

  // Reschedule booking mutation
  const rescheduleBookingMutation = useMutation({
    mutationFn: ({ 
      meetingId, 
      newStartTime, 
      newDuration 
    }: { 
      meetingId: string; 
      newStartTime: string; 
      newDuration?: number; 
    }) => api.booking.rescheduleBooking(meetingId, newStartTime, newDuration),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.meetings.all() });
      toast.success("Booking rescheduled successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to reschedule booking");
    },
  });

  return {
    durations: durations || [],
    isLoadingDurations,
    getAvailableSlots,
    bookSession: (therapistId: string, startTime: string, duration: number, notes?: string) =>
      bookSessionMutation.mutate({ therapistId, startTime, duration, notes }),
    cancelBooking: (meetingId: string) => cancelBookingMutation.mutate(meetingId),
    rescheduleBooking: (meetingId: string, newStartTime: string, newDuration?: number) =>
      rescheduleBookingMutation.mutate({ meetingId, newStartTime, newDuration }),
    isBooking: bookSessionMutation.isPending,
    isCancelling: cancelBookingMutation.isPending,
    isRescheduling: rescheduleBookingMutation.isPending,
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
    queryKey: queryKeys.booking.meetings.list(filters),
    queryFn: () => api.booking.getMeetings(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  return {
    meetings: meetings || [],
    isLoading,
    error,
    refetch,
  };
}