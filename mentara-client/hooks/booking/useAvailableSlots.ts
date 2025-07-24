import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { TimezoneUtils } from "@/lib/utils/timezone";


export interface TimeSlot {
  time: string;
  startTime: string;
  endTime: string;
  availableDurations: {
    id: string;
    name: string;
    duration: number;
  }[];
}

/**
 * Hook for getting available time slots for a therapist
 */
export function useAvailableSlots(therapistId: string, date: string) {
  const api = useApi();

  const {
    data: slots,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['booking', 'slots', therapistId, date],
    queryFn: async () => {
      console.log(`[useAvailableSlots] Fetching slots for therapist ${therapistId} on ${date}`);
      try {
        const result = await api.booking.availability.getSlots(therapistId, date);
        console.log(`[useAvailableSlots] Successfully fetched ${result?.length || 0} slots:`, result);
        return result;
      } catch (error: unknown) {
        console.error(`[useAvailableSlots] Error fetching slots:`, error);
        // Add more context to error messages
        const err = error as { response?: { status: number; data?: { message?: string } }; message?: string };
        
        if (err.response?.status === 400 && err.response?.data?.message?.includes('advance')) {
          throw new Error('Bookings must be made at least 30 minutes in advance');
        } else if (err.response?.status === 404) {
          throw new Error(`No availability found for this therapist on ${date}. The therapist may not have set their availability for this day.`);
        } else if (err.response?.status === 401) {
          throw new Error('Authentication required - please sign in again');
        } else {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to load available slots';
          console.error(`[useAvailableSlots] Full error details:`, {
            status: err.response?.status,
            data: err.response?.data,
            message: err.message,
            therapistId,
            date,
          });
          throw new Error(errorMessage);
        }
      }
    },
    enabled: !!(therapistId && date),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error: Error) => {
      console.log(`[useAvailableSlots] Retry attempt ${failureCount + 1} for error:`, error.message);
      // Don't retry on authentication or validation errors
      if (error.message?.includes('Authentication') || error.message?.includes('advance')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Helper functions
  const getSlotsForTime = (timeString: string) => {
    return slots?.find(slot => 
      new Date(slot.startTime).toTimeString().slice(0, 5) === timeString
    );
  };

  const getAvailableDurationsForSlot = (startTime: string) => {
    const slot = slots?.find(s => s.startTime === startTime);
    return slot?.availableDurations || [];
  };

  const getTimeSlots = () => {
    return slots?.map(slot => ({
      time: TimezoneUtils.format(new Date(slot.startTime), 'h:mm a'),
      startTime: slot.startTime,
      endTime: slot.endTime || slot.startTime, // Use endTime if available, otherwise use startTime
      availableDurations: slot.availableDurations,
    })) || [];
  };

  const isTimeAvailable = (timeString: string, duration: number) => {
    const slot = getSlotsForTime(timeString);
    return slot?.availableDurations.some(d => d.duration === duration) || false;
  };

  return {
    slots: slots || [],
    timeSlots: getTimeSlots(),
    isLoading,
    error,
    refetch,
    getSlotsForTime,
    getAvailableDurationsForSlot,
    isTimeAvailable,
    hasSlots: (slots?.length || 0) > 0,
  };
}

/**
 * Hook for getting available slots for multiple dates
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useMultiDateSlots(therapistId: string, dates: string[]) {
  // This would need useQueries from React Query
  // For now, let's return a simpler implementation
  return {
    // Implementation would go here for multiple date queries
    isLoading: false,
    slotsData: {} as Record<string, TimeSlot[]>,
  };
}