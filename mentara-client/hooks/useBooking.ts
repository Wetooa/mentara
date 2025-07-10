import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
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

  // Create meeting mutation (for clients)
  const createMeetingMutation = useMutation({
    mutationFn: ({ 
      therapistId, 
      startTime, 
      duration, 
      title,
      description,
      meetingType = 'video',
    }: { 
      therapistId: string; 
      startTime: string; 
      duration: number; 
      title?: string;
      description?: string;
      meetingType?: 'video' | 'audio' | 'in_person' | 'chat';
    }) => api.booking.createMeeting({
      therapistId,
      startTime,
      duration,
      title: title || 'Therapy Session',
      description,
      meetingType,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.meetings.all() });
      toast.success("Session booked successfully");
    },
    onError: (error: MentaraApiError) => {
      toast.error(error.message || "Failed to book session");
    },
  });

  // Cancel meeting mutation
  const cancelMeetingMutation = useMutation({
    mutationFn: (meetingId: string) => api.booking.cancelMeeting(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.meetings.all() });
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
        meetingType?: 'video' | 'audio' | 'in_person' | 'chat';
        status?: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
      };
    }) => api.booking.updateMeeting(meetingId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.meetings.all() });
      toast.success("Meeting updated successfully");
    },
    onError: (error: MentaraApiError) => {
      toast.error(error.message || "Failed to update meeting");
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
      meetingType?: 'video' | 'audio' | 'in_person' | 'chat';
    }) => createMeetingMutation.mutate(data),
    cancelMeeting: (meetingId: string) => cancelMeetingMutation.mutate(meetingId),
    updateMeeting: (meetingId: string, updates: any) => 
      updateMeetingMutation.mutate({ meetingId, updates }),
    isCreating: createMeetingMutation.isPending,
    isCancelling: cancelMeetingMutation.isPending,
    isUpdating: updateMeetingMutation.isPending,
    
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