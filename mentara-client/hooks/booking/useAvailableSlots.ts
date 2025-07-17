import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

export interface TimeSlot {
  startTime: string;
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
    queryKey: queryKeys.booking.slots(therapistId, date),
    queryFn: () => api.booking.getAvailableSlots(therapistId, date),
    enabled: !!(therapistId && date),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
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
      time: new Date(slot.startTime).toTimeString().slice(0, 5),
      startTime: slot.startTime,
      durations: slot.availableDurations.map(d => d.duration),
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
export function useMultiDateSlots(therapistId: string, dates: string[]) {
  const api = useApi();

  const queries = dates.map(date => ({
    queryKey: queryKeys.booking.slots(therapistId, date),
    queryFn: () => api.booking.getAvailableSlots(therapistId, date),
    enabled: !!(therapistId && date),
    staleTime: 1000 * 60 * 5,
  }));

  // This would need useQueries from React Query
  // For now, let's return a simpler implementation
  return {
    // Implementation would go here for multiple date queries
    isLoading: false,
    slotsData: {} as Record<string, TimeSlot[]>,
  };
}