import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { toast } from 'sonner';

interface AvailableSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface MeetingDuration {
  id: string;
  name: string;
  minutes: number;
}

interface PaymentMethod {
  id: string;
  type: string;
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

interface CreateMeetingRequest {
  therapistId: string;
  date: string;
  timeSlot: string;
  duration: number;
  meetingType: string;
  title: string;
  description?: string;
}

interface UseBookingFlowReturn {
  // State
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedSlot: AvailableSlot | null;
  setSelectedSlot: (slot: AvailableSlot | null) => void;
  selectedDuration: MeetingDuration | null;
  setSelectedDuration: (duration: MeetingDuration | null) => void;
  meetingType: string;
  setMeetingType: (type: string) => void;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  
  // Data
  availableSlots: AvailableSlot[] | undefined;
  durations: MeetingDuration[] | undefined;
  paymentMethods: PaymentMethod[] | undefined;
  
  // Loading states
  slotsLoading: boolean;
  durationsLoading: boolean;
  paymentMethodsLoading: boolean;
  
  // Actions
  createMeeting: (data: CreateMeetingRequest) => Promise<void>;
  
  // Mutations
  isCreatingMeeting: boolean;
  
  // Utilities
  resetForm: () => void;
  isFormValid: () => boolean;
}

export function useBookingFlow(therapistId?: string): UseBookingFlowReturn {
  const api = useApi();
  const queryClient = useQueryClient();
  
  // Local state
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<MeetingDuration | null>(null);
  const [meetingType, setMeetingType] = useState("VIDEO");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Fetch available slots
  const {
    data: availableSlots,
    isLoading: slotsLoading,
    error: slotsError,
  } = useQuery({
    queryKey: ["available-slots", therapistId, selectedDate?.toISOString()],
    queryFn: () => {
      if (!therapistId || !selectedDate) {
        return Promise.resolve([]);
      }
      return api.booking.slots.getAvailable({
        therapistId,
        date: selectedDate.toISOString(),
      });
    },
    enabled: !!therapistId && !!selectedDate,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Get available durations
  const { data: durations = [], isLoading: durationsLoading } = useQuery({
    queryKey: ["meeting-durations"],
    queryFn: () => api.booking.durations.getAll(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Get payment methods
  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => api.booking.payment.getPaymentMethods(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Create meeting mutation
  const createMeetingMutation = useMutation({
    mutationFn: (meetingData: CreateMeetingRequest) => {
      return api.booking.meetings.create(meetingData);
    },
    onSuccess: () => {
      toast.success("Meeting booked successfully!");
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["available-slots"] });
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to book meeting. Please try again.");
    },
  });

  // Action handlers
  const createMeeting = async (data: CreateMeetingRequest): Promise<void> => {
    await createMeetingMutation.mutateAsync(data);
  };

  const resetForm = () => {
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setSelectedDuration(null);
    setMeetingType("VIDEO");
    setTitle("");
    setDescription("");
  };

  const isFormValid = (): boolean => {
    return !!(
      selectedDate &&
      selectedSlot &&
      selectedDuration &&
      title.trim() &&
      meetingType
    );
  };

  return {
    // State
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
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
    durations,
    paymentMethods,
    
    // Loading states
    slotsLoading,
    durationsLoading,
    paymentMethodsLoading,
    
    // Actions
    createMeeting,
    
    // Mutations
    isCreatingMeeting: createMeetingMutation.isPending,
    
    // Utilities
    resetForm,
    isFormValid,
  };
}