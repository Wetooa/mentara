import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { STALE_TIME, GC_TIME } from '@/lib/constants/react-query';
import { toast } from 'sonner';

interface AvailabilitySlot {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  timezone: string;
  notes?: string;
  isRecurring: boolean;
  endDate?: string;
}

interface AvailabilityFormData {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  timezone: string;
  notes?: string;
}

interface UseTherapistAvailabilityReturn {
  // State
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  editingSlot: AvailabilitySlot | null;
  setEditingSlot: (slot: AvailabilitySlot | null) => void;
  formData: AvailabilityFormData;
  setFormData: (data: AvailabilityFormData) => void;
  
  // Data
  availability: AvailabilitySlot[] | undefined;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  createAvailability: (data: Omit<AvailabilityFormData, "notes"> & { notes?: string }) => Promise<void>;
  updateAvailability: (id: string, data: Partial<AvailabilityFormData>) => Promise<void>;
  deleteAvailability: (id: string) => Promise<void>;
  
  // Mutations loading states
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Utilities
  resetForm: () => void;
  handleEditSlot: (slot: AvailabilitySlot) => void;
  refetch: () => void;
}

export function useTherapistAvailability(): UseTherapistAvailabilityReturn {
  const api = useApi();
  const queryClient = useQueryClient();
  
  // Local state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [formData, setFormData] = useState<AvailabilityFormData>({
    dayOfWeek: "",
    startTime: "",
    endTime: "",
    timezone: "UTC",
    notes: "",
  });

  // Fetch availability data
  const {
    data: availability,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.therapist.availability(),
    queryFn: () => api.booking.availability.getMyAvailability(),
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Create availability mutation
  const createAvailabilityMutation = useMutation({
    mutationFn: (data: Omit<AvailabilityFormData, "notes"> & { notes?: string }) =>
      api.booking.availability.create(data),
    onSuccess: () => {
      toast.success("Availability slot created successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.therapist.availability() });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create availability slot");
    },
  });

  // Update availability mutation
  const updateAvailabilityMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AvailabilityFormData> }) =>
      api.booking.availability.update(id, data),
    onSuccess: () => {
      toast.success("Availability slot updated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.therapist.availability() });
      setEditingSlot(null);
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update availability slot");
    },
  });

  // Delete availability mutation
  const deleteAvailabilityMutation = useMutation({
    mutationFn: (id: string) => api.booking.availability.delete(id),
    onSuccess: () => {
      toast.success("Availability slot deleted successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.therapist.availability() });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete availability slot");
    },
  });

  // Action handlers
  const createAvailability = async (data: Omit<AvailabilityFormData, "notes"> & { notes?: string }): Promise<void> => {
    await createAvailabilityMutation.mutateAsync(data);
  };

  const updateAvailability = async (id: string, data: Partial<AvailabilityFormData>): Promise<void> => {
    await updateAvailabilityMutation.mutateAsync({ id, data });
  };

  const deleteAvailability = async (id: string): Promise<void> => {
    await deleteAvailabilityMutation.mutateAsync(id);
  };

  const resetForm = () => {
    setFormData({
      dayOfWeek: "",
      startTime: "",
      endTime: "",
      timezone: "UTC",
      notes: "",
    });
  };

  const handleEditSlot = (slot: AvailabilitySlot) => {
    setEditingSlot(slot);
    setFormData({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      timezone: slot.timezone,
      notes: slot.notes || "",
    });
    setIsAddDialogOpen(true);
  };

  return {
    // State
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingSlot,
    setEditingSlot,
    formData,
    setFormData,
    
    // Data
    availability,
    isLoading,
    error,
    
    // Actions
    createAvailability,
    updateAvailability,
    deleteAvailability,
    
    // Mutations loading states
    isCreating: createAvailabilityMutation.isPending,
    isUpdating: updateAvailabilityMutation.isPending,
    isDeleting: deleteAvailabilityMutation.isPending,
    
    // Utilities
    resetForm,
    handleEditSlot,
    refetch,
  };
}