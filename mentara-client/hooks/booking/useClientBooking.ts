import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { toast } from 'sonner';
import { TimezoneUtils } from '@/lib/utils/timezone';

interface TimeSlot {
  time: string;
  startTime: string;
  endTime: string;
  availableDurations: Array<{
    id: string;
    name: string;
    duration: number;
  }>;
}

interface BookingStep {
  step: number;
  title: string;
  description: string;
}

export const BOOKING_STEPS: BookingStep[] = [
  {
    step: 1,
    title: "Session Details",
    description: "Confirm your selected time and session preferences",
  },
  {
    step: 2,
    title: "Session Notes",
    description: "Add notes about what you'd like to discuss",
  },
  {
    step: 3,
    title: "Payment & Confirmation",
    description: "Review and complete your booking",
  },
];

interface UseClientBookingProps {
  therapistId: string;
  selectedSlot: TimeSlot;
  selectedDate: Date;
  enabled?: boolean;
  onSuccess?: () => void;
  onClose?: () => void;
}

/**
 * Comprehensive hook for client booking flow including payment processing
 */
export function useClientBooking({ 
  therapistId, 
  selectedSlot,
  selectedDate: initialSelectedDate,
  enabled = true, 
  onSuccess, 
  onClose 
}: UseClientBookingProps) {
  const api = useApi();
  const queryClient = useQueryClient();

  // Form state - initialize with pre-selected data
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>(initialSelectedDate);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(selectedSlot);
  const [selectedDuration, setSelectedDuration] = useState<{
    id: string;
    name: string;
    duration: number;
  } | null>(
    // Auto-select duration if only one option available
    selectedSlot.availableDurations.length === 1 
      ? selectedSlot.availableDurations[0] 
      : null
  );
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");

  // Get therapist profile
  const {
    data: therapist,
    isLoading: therapistLoading,
    error: therapistError,
  } = useQuery({
    queryKey: ["therapist-profile", therapistId],
    queryFn: async () => {
      try {
        console.log('useClientBooking: Fetching therapist profile for ID:', therapistId);
        const result = await api.therapists.getTherapistProfile(therapistId);
        console.log('useClientBooking: Therapist profile result:', result);
        return result;
      } catch (error) {
        console.error('useClientBooking: Failed to fetch therapist profile:', error);
        throw error;
      }
    },
    enabled: enabled && !!therapistId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error: any) => {
      console.log('useClientBooking: Retry attempt', failureCount, 'for therapist profile error:', error);
      // Don't retry on 404 (therapist not found) or 401 (unauthorized)
      if (error?.response?.status === 404 || error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Get payment methods
  const {
    data: paymentMethods = [],
    isLoading: paymentMethodsLoading,
  } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => api.booking.payment.getPaymentMethods(),
    enabled: currentStep === 3,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Get durations
  const {
    data: durations = [],
    isLoading: durationsLoading,
  } = useQuery({
    queryKey: ["meeting-durations"],
    queryFn: () => api.booking.durations.getAll(),
    enabled: enabled,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Create booking mutation with payment processing
  const createBookingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTimeSlot || !selectedDuration || !paymentMethodId) {
        throw new Error("Missing required booking information");
      }

      // Create the meeting first (ensure timezone is properly handled)
      const meeting = await api.booking.meetings.create({
        therapistId,
        startTime: TimezoneUtils.formatForApi(selectedTimeSlot.startTime),
        duration: selectedDuration.duration,
        title: sessionTitle || `Session with ${therapist?.name}`,
        description: sessionDescription,
        meetingType: "video",
      });

      // Process payment for the session
      const payment = await api.booking.payment.processSessionPayment({
        meetingId: meeting.id,
        paymentMethodId,
        amount: therapist?.hourlyRate * (selectedDuration.duration / 60) || 0,
        currency: "USD",
      });

      return { meeting, payment };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["available-slots"] });
      toast.success("Session booked successfully!");
      onSuccess?.();
      onClose?.();
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to book session. Please try again.");
    },
  });

  // Form management functions
  const resetForm = () => {
    setCurrentStep(1);
    setSelectedDate(undefined);
    setSelectedTimeSlot(null);
    setSelectedDuration(null);
    setSessionTitle("");
    setSessionDescription("");
    setPaymentMethodId("");
  };


  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirmBooking = () => {
    createBookingMutation.mutate();
  };

  // Validation helpers
  const isStep1Complete = selectedTimeSlot && selectedDuration;
  const isStep2Complete = sessionTitle.trim() && isStep1Complete;
  const isStep3Complete = paymentMethodId && isStep2Complete;

  return {
    // Form state
    currentStep,
    setCurrentStep,
    selectedDate,
    setSelectedDate,
    selectedTimeSlot,
    setSelectedTimeSlot,
    selectedDuration,
    setSelectedDuration,
    sessionTitle,
    setSessionTitle,
    sessionDescription,
    setSessionDescription,
    paymentMethodId,
    setPaymentMethodId,

    // Data
    therapist,
    paymentMethods,
    durations,

    // Loading states
    therapistLoading,
    paymentMethodsLoading,
    durationsLoading,
    isBooking: createBookingMutation.isPending,

    // Error states
    therapistError,
    bookingError: createBookingMutation.error,

    // Actions
    handleNextStep,
    handlePrevStep,
    handleConfirmBooking,
    resetForm,

    // Validation
    isStep1Complete,
    isStep2Complete,
    isStep3Complete,

    // Constants
    BOOKING_STEPS,
  };
}

/**
 * Simplified booking hook for basic use cases
 */
export function useSimpleBooking(therapistId: string) {
  const { 
    therapist, 
    therapistLoading, 
    durations, 
    durationsLoading,
    handleConfirmBooking,
    isBooking 
  } = useClientBooking({ therapistId });

  const api = useApi();
  const queryClient = useQueryClient();

  const quickBookMutation = useMutation({
    mutationFn: async (data: {
      startTime: string;
      duration: number;
      title?: string;
      description?: string;
    }) => {
      return api.booking.meetings.create({
        therapistId,
        startTime: data.startTime,
        duration: data.duration,
        title: data.title || `Session with ${therapist?.name}`,
        description: data.description,
        meetingType: "video",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["available-slots"] });
      toast.success("Session booked successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to book session. Please try again.");
    },
  });

  return {
    therapist,
    durations,
    isLoading: therapistLoading || durationsLoading,
    quickBook: quickBookMutation.mutate,
    isBooking: quickBookMutation.isPending,
  };
}