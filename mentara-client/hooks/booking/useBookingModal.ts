import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { useSubscriptionStatus } from '@/hooks/billing';
import { toast } from 'sonner';
import { TherapistCardData } from '@/types/therapist';

interface AvailableSlot {
  id: string;
  startTime: string;
  endTime: string;
  availableDurations: MeetingDuration[];
}

interface MeetingDuration {
  id: string;
  name: string;
  duration: number;
}

enum MeetingType {
  VIDEO = "video",
}

interface CreateMeetingRequest {
  therapistId: string;
  startTime: string;
  duration: number;
  title?: string;
  description?: string;
  meetingType: MeetingType;
  requestId?: string;
}

interface UseBookingModalReturn {
  // State
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedSlot: AvailableSlot | null;
  setSelectedSlot: (slot: AvailableSlot | null) => void;
  selectedDuration: MeetingDuration | null;
  setSelectedDuration: (duration: MeetingDuration | null) => void;
  meetingType: MeetingType;
  setMeetingType: (type: MeetingType) => void;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  
  // Data
  availableSlots: AvailableSlot[];
  
  // Loading states
  slotsLoading: boolean;
  slotsError: Error | null;
  subscriptionLoading: boolean;
  
  // Payment status
  isActive: boolean;
  isTrial: boolean;
  isPastDue: boolean;
  hasPaymentIssue: boolean;
  needsPaymentMethod: boolean;
  
  // Actions
  handleBooking: () => void;
  resetForm: (therapist?: TherapistCardData) => void;
  
  // Mutations
  isCreatingMeeting: boolean;
  createMeetingError: Error | null;
  
  // Validation
  isFormValid: boolean;
  canBook: boolean;
}

export function useBookingModal(
  therapist: TherapistCardData | null,
  isOpen: boolean,
  onSuccess?: (meeting: CreateMeetingRequest) => void,
  onClose?: () => void
): UseBookingModalReturn {
  const api = useApi();
  const queryClient = useQueryClient();
  
  // Local state
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<MeetingDuration | null>(null);
  const [meetingType, setMeetingType] = useState<MeetingType>(MeetingType.VIDEO);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Deduplication state
  const [isLocked, setIsLocked] = useState(false);
  const lastBookingAttemptRef = useRef<number>(0);
  const cooldownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const MINIMUM_BOOKING_INTERVAL = 2000; // 2 seconds minimum between booking attempts
  const COOLDOWN_PERIOD = 3000; // 3 seconds cooldown after successful booking

  // Payment verification
  const {
    isActive,
    isTrial,
    isPastDue,
    hasPaymentIssue,
    needsPaymentMethod,
    isLoading: subscriptionLoading
  } = useSubscriptionStatus();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && therapist) {
      resetForm(therapist);
    }
  }, [isOpen, therapist]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current);
      }
    };
  }, []);

  // Get available slots for selected date
  const {
    data: availableSlots = [],
    isLoading: slotsLoading,
    error: slotsError,
  } = useQuery({
    queryKey: ["available-slots", therapist?.id, selectedDate?.toISOString()],
    queryFn: () => {
      if (!therapist || !selectedDate) return [];
      return api.booking.availability.getSlots(
        therapist.id,
        selectedDate.toISOString().split("T")[0]
      );
    },
    enabled: !!(therapist && selectedDate),
  });

  // Create meeting mutation with deduplication
  const createMeetingMutation = useMutation({
    mutationFn: (meetingData: CreateMeetingRequest & { requestId?: string }) => {
      // Generate unique request ID for tracking if not provided
      const requestId = meetingData.requestId || crypto.randomUUID();
      const timestamp = new Date().toISOString();
      
      console.log(`🔄 [BOOKING-DEBUG] Starting API call`, {
        requestId,
        timestamp,
        therapistId: meetingData.therapistId,
        startTime: meetingData.startTime,
        stackTrace: new Error().stack,
        mutationKey: 'createMeeting'
      });
      
      // Add request ID to the data for backend tracking
      const requestWithId = {
        ...meetingData,
        requestId
      };
      
      return api.booking.meetings.create(requestWithId);
    },
    // Use mutation scope to serialize booking mutations for the same therapist
    scope: {
      id: therapist?.id ? `booking-${therapist.id}` : 'booking-default',
    },
    onMutate: () => {
      // Set lock state to prevent additional attempts
      setIsLocked(true);
      
      // Clear any existing cooldown
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current);
        cooldownTimeoutRef.current = null;
      }
    },
    onSuccess: (data) => {
      console.log(`✅ [BOOKING-DEBUG] API call succeeded`, {
        meetingId: data?.id,
        timestamp: new Date().toISOString()
      });
      
      toast.success("Session booked successfully!");
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["available-slots"] });
      onSuccess?.(data);
      onClose?.();
      
      // Set cooldown period to prevent immediate retry
      cooldownTimeoutRef.current = setTimeout(() => {
        setIsLocked(false);
      }, COOLDOWN_PERIOD);
    },
    onError: (error: any) => {
      console.error(`❌ [BOOKING-DEBUG] API call failed`, {
        error: error?.message,
        timestamp: new Date().toISOString(),
        errorDetails: error
      });
      
      // Release lock on error but with a small delay to prevent spam
      setTimeout(() => {
        setIsLocked(false);
      }, 1000);
      
      toast.error(error?.message || "Failed to book session. Please try again.");
    },
    onSettled: () => {
      // Update last attempt timestamp
      lastBookingAttemptRef.current = Date.now();
    },
  });

  // Form validation
  const isFormValid = !!(
    selectedDate && 
    selectedSlot && 
    selectedDuration && 
    title.trim()
  );

  // Enhanced validation including deduplication states
  const canBook = !!(
    (isActive || isTrial) && 
    !hasPaymentIssue && 
    !needsPaymentMethod &&
    !isLocked &&
    !createMeetingMutation.isPending
  );

  const handleBooking = useCallback(() => {
    // Generate unique call ID for this handleBooking call
    const callId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const currentTime = Date.now();
    
    console.log(`🎯 [BOOKING-DEBUG] handleBooking called`, {
      callId,
      timestamp,
      therapistId: therapist?.id,
      isCreatingMeeting: createMeetingMutation.isPending,
      isLocked: isLocked,
      timeSinceLastAttempt: currentTime - lastBookingAttemptRef.current,
      stackTrace: new Error().stack,
      formData: {
        selectedDate: selectedDate?.toISOString(),
        selectedSlot: selectedSlot?.id,
        selectedDuration: selectedDuration?.id,
        title: title,
      }
    });

    // First check: basic validation
    if (!therapist || !selectedSlot || !selectedDuration || !selectedDate) {
      console.log(`⚠️ [BOOKING-DEBUG] Early return - missing required data`, { callId });
      return;
    }

    // Second check: mutation state
    if (createMeetingMutation.isPending) {
      console.log(`⚠️ [BOOKING-DEBUG] Early return - mutation already pending`, { callId });
      toast.error("Booking in progress, please wait...");
      return;
    }

    // Third check: deduplication lock
    if (isLocked) {
      console.log(`⚠️ [BOOKING-DEBUG] Early return - locked due to recent booking attempt`, { callId });
      toast.error("Please wait before trying to book again.");
      return;
    }

    // Fourth check: rate limiting
    const timeSinceLastAttempt = currentTime - lastBookingAttemptRef.current;
    if (timeSinceLastAttempt < MINIMUM_BOOKING_INTERVAL) {
      console.log(`⚠️ [BOOKING-DEBUG] Early return - rate limited`, { 
        callId, 
        timeSinceLastAttempt,
        minimumInterval: MINIMUM_BOOKING_INTERVAL 
      });
      toast.error("Please wait a moment before trying again.");
      return;
    }

    // Payment verification
    if (!isActive && !isTrial) {
      console.log(`⚠️ [BOOKING-DEBUG] Early return - no active subscription`, { callId });
      toast.error("Active subscription required to book sessions. Please upgrade your plan.");
      return;
    }

    if (hasPaymentIssue) {
      console.log(`⚠️ [BOOKING-DEBUG] Early return - payment issue`, { callId });
      toast.error("Please resolve payment issues before booking sessions. Check your billing settings.");
      return;
    }

    if (needsPaymentMethod) {
      console.log(`⚠️ [BOOKING-DEBUG] Early return - needs payment method`, { callId });
      toast.error("Please add a payment method to book sessions.");
      return;
    }

    const startTime = new Date(selectedSlot.startTime);
    const requestId = crypto.randomUUID();

    const meetingData: CreateMeetingRequest & { requestId: string } = {
      therapistId: therapist.id,
      startTime: startTime.toISOString(),
      duration: selectedDuration.duration,
      title: title || `Session with ${therapist.name}`,
      description,
      meetingType,
      requestId,
    };

    console.log(`🚀 [BOOKING-DEBUG] Calling mutation.mutate`, {
      callId,
      requestId,
      timestamp: new Date().toISOString(),
      meetingData
    });

    createMeetingMutation.mutate(meetingData);
  }, [
    therapist,
    selectedSlot,
    selectedDuration,
    selectedDate,
    createMeetingMutation,
    isLocked,
    isActive,
    isTrial,
    hasPaymentIssue,
    needsPaymentMethod,
    title,
    description,
    meetingType
  ]);

  const resetForm = (therapist?: TherapistCardData) => {
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setSelectedDuration(null);
    setMeetingType(MeetingType.VIDEO);
    setTitle(therapist ? `Session with ${therapist.name}` : "");
    setDescription("");
  };

  const handleSlotSelection = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    setSelectedDuration(null); // Reset duration when slot changes
  };

  return {
    // State
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot: handleSlotSelection,
    selectedDuration,
    setSelectedDuration,
    meetingType,
    setMeetingType,
    title,
    setTitle,
    description,
    setDescription,
    
    // Data
    availableSlots,
    
    // Loading states
    slotsLoading,
    slotsError,
    subscriptionLoading,
    
    // Payment status
    isActive,
    isTrial,
    isPastDue,
    hasPaymentIssue,
    needsPaymentMethod,
    
    // Actions
    handleBooking,
    resetForm,
    
    // Mutations
    isCreatingMeeting: createMeetingMutation.isPending,
    createMeetingError: createMeetingMutation.error,
    
    // Validation
    isFormValid,
    canBook: isFormValid && canBook,
  };
}