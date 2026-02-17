import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME, GC_TIME } from "@/lib/constants/react-query";
// import { useSubscriptionStatus } from '@/hooks/billing'; // Removed - subscriptions are outdated
import { toast } from "sonner";
import { TherapistCardData } from "@/types/therapist";

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
  ONLINE = "online",
  IN_PERSON = "in-person",
}

interface CreateMeetingRequest {
  therapistId: string;
  startTime: string;
  duration: number;
  title?: string;
  description?: string;
  meetingType: MeetingType;
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
  const [selectedDuration, setSelectedDuration] =
    useState<MeetingDuration | null>(null);
  const [meetingType, setMeetingType] = useState<MeetingType>(
    MeetingType.ONLINE
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Deduplication state
  const [isLocked, setIsLocked] = useState(false);
  const lastBookingAttemptRef = useRef<number>(0);
  const cooldownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const MINIMUM_BOOKING_INTERVAL = 2000; // 2 seconds minimum between booking attempts
  const COOLDOWN_PERIOD = 3000; // 3 seconds cooldown after successful booking

  // Payment verification - removed subscription dependency since subscriptions are outdated
  // For now, we'll allow all bookings without subscription checks
  const isActive = true; // Allow all users to book
  const isTrial = false;
  const isPastDue = false;
  const hasPaymentIssue = false;
  const needsPaymentMethod = false;
  const subscriptionLoading = false;

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
    queryKey: queryKeys.booking.slots(therapist?.id || '', selectedDate?.toISOString()?.split('T')[0]),
    queryFn: () => {
      if (!therapist || !selectedDate) return [];
      return api.booking.availability.getSlots(
        therapist.id,
        selectedDate.toISOString().split("T")[0]
      );
    },
    enabled: !!(therapist && selectedDate),
    staleTime: STALE_TIME.SHORT,
    gcTime: GC_TIME.MEDIUM,
    refetchOnWindowFocus: false,
  });

  // Create meeting mutation with deduplication
  const createMeetingMutation = useMutation({
    mutationFn: (meetingData: CreateMeetingRequest) => {
      return api.booking.meetings.create(meetingData);
    },
    // Use mutation scope to serialize booking mutations for the same therapist
    scope: {
      id: therapist?.id ? `booking-${therapist.id}` : "booking-default",
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
      toast.success("Session booked successfully!");
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.booking.all });
      onSuccess?.(data);
      onClose?.();

      // Set cooldown period to prevent immediate retry
      cooldownTimeoutRef.current = setTimeout(() => {
        setIsLocked(false);
      }, COOLDOWN_PERIOD);
    },
    onError: (error: any) => {
      // Release lock on error but with a small delay to prevent spam
      setTimeout(() => {
        setIsLocked(false);
      }, 1000);

      toast.error(
        error?.message || "Failed to book session. Please try again."
      );
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
  const canBook = !!(!isLocked && !createMeetingMutation.isPending);

  const handleBooking = useCallback(() => {
    // Basic validation
    if (!therapist || !selectedSlot || !selectedDuration || !selectedDate) {
      return;
    }

    // Prevent duplicate calls
    if (createMeetingMutation.isPending || isLocked) {
      return;
    }

    // Rate limiting
    const currentTime = Date.now();
    const timeSinceLastAttempt = currentTime - lastBookingAttemptRef.current;
    if (timeSinceLastAttempt < MINIMUM_BOOKING_INTERVAL) {
      return;
    }

    // Payment verification - removed subscription checks since subscriptions are outdated
    // All users can now book sessions without subscription requirements
    // TODO: If payment verification is needed in the future, implement it here

    const startTime = new Date(selectedSlot.startTime);

    const meetingData: CreateMeetingRequest = {
      therapistId: therapist.id,
      startTime: startTime.toISOString(),
      duration: selectedDuration.duration,
      title: title || `Session with ${therapist.name}`,
      description,
      meetingType,
    };

    createMeetingMutation.mutate(meetingData);
  }, [
    therapist,
    selectedSlot,
    selectedDuration,
    selectedDate,
    createMeetingMutation,
    isLocked,
    title,
    description,
    meetingType,
  ]);

  const resetForm = (therapist?: TherapistCardData) => {
    // Default to the day after today (tomorrow) at midnight
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    setSelectedDate(tomorrow);
    setSelectedSlot(null);
    setSelectedDuration(null);
    setMeetingType(MeetingType.ONLINE);
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
