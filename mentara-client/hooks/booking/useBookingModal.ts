import { useState, useEffect } from 'react';
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

  // Create meeting mutation
  const createMeetingMutation = useMutation({
    mutationFn: (meetingData: CreateMeetingRequest) => {
      return api.booking.meetings.create(meetingData);
    },
    onSuccess: (data) => {
      toast.success("Session booked successfully!");
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["available-slots"] });
      onSuccess?.(data);
      onClose?.();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to book session. Please try again.");
    },
  });

  // Form validation
  const isFormValid = !!(
    selectedDate && 
    selectedSlot && 
    selectedDuration && 
    title.trim()
  );

  // Payment validation
  const canBook = !!(
    (isActive || isTrial) && 
    !hasPaymentIssue && 
    !needsPaymentMethod
  );

  const handleBooking = () => {
    if (!therapist || !selectedSlot || !selectedDuration || !selectedDate) {
      return;
    }

    // Payment verification
    if (!isActive && !isTrial) {
      toast.error("Active subscription required to book sessions. Please upgrade your plan.");
      return;
    }

    if (hasPaymentIssue) {
      toast.error("Please resolve payment issues before booking sessions. Check your billing settings.");
      return;
    }

    if (needsPaymentMethod) {
      toast.error("Please add a payment method to book sessions.");
      return;
    }

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
  };

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