import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { toast } from 'sonner';

interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };
}

interface NewAvailabilityData {
  date: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };
}

interface UseAvailabilityManagerReturn {
  // State
  showAddDialog: boolean;
  setShowAddDialog: (show: boolean) => void;
  editingSlot: AvailabilitySlot | null;
  setEditingSlot: (slot: AvailabilitySlot | null) => void;
  newAvailability: NewAvailabilityData;
  setNewAvailability: (data: NewAvailabilityData) => void;
  
  // Data
  availability: AvailabilitySlot[] | undefined;
  isLoading: boolean;
  error: Error | null;
  
  // Stats (computed)
  availableSlots: number;
  recurringSlots: number;
  totalSlots: number;
  
  // Actions
  handleAddAvailability: () => void;
  handleUpdateAvailability: () => void;
  handleDeleteAvailability: (id: string) => void;
  handleToggleAvailability: (slot: AvailabilitySlot) => void;
  resetForm: () => void;
  refetch: () => void;
  
  // Loading states
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isProcessing: boolean;
  
  // Utilities
  formatTime: (time: string) => string;
  formatDate: (dateString: string) => string;
  groupAvailabilityByDate: (slots: AvailabilitySlot[]) => Record<string, AvailabilitySlot[]>;
}

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return [`${hour}:00`, `${hour}:30`];
}).flat();

export function useAvailabilityManager(): UseAvailabilityManagerReturn {
  const api = useApi();
  const queryClient = useQueryClient();
  
  // Local state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [newAvailability, setNewAvailability] = useState<NewAvailabilityData>({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: false,
  });

  // Fetch availability slots
  const { data: availability, isLoading, error, refetch } = useQuery({
    queryKey: ['therapist', 'availability'],
    queryFn: () => api.booking.availability.get(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create availability mutation
  const createAvailabilityMutation = useMutation({
    mutationFn: (data: NewAvailabilityData) => api.booking.availability.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist', 'availability'] });
      toast.success('Availability added successfully!');
      setShowAddDialog(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Error creating availability:', error);
      toast.error('Failed to add availability. Please try again.');
    },
  });

  // Update availability mutation
  const updateAvailabilityMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AvailabilitySlot> }) =>
      api.booking.availability.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist', 'availability'] });
      toast.success('Availability updated successfully!');
      setEditingSlot(null);
    },
    onError: (error) => {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability. Please try again.');
    },
  });

  // Delete availability mutation
  const deleteAvailabilityMutation = useMutation({
    mutationFn: (id: string) => api.booking.availability.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist', 'availability'] });
      toast.success('Availability deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting availability:', error);
      toast.error('Failed to delete availability. Please try again.');
    },
  });

  // Computed stats
  const availableSlots = availability?.filter(slot => slot.isAvailable).length || 0;
  const recurringSlots = availability?.filter(slot => slot.isRecurring).length || 0;
  const totalSlots = availability?.length || 0;

  // Loading states
  const isCreating = createAvailabilityMutation.isPending;
  const isUpdating = updateAvailabilityMutation.isPending;
  const isDeleting = deleteAvailabilityMutation.isPending;
  const isProcessing = isCreating || isUpdating || isDeleting;

  // Action handlers
  const resetForm = () => {
    setNewAvailability({
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      isRecurring: false,
    });
  };

  const handleAddAvailability = () => {
    createAvailabilityMutation.mutate(newAvailability);
  };

  const handleUpdateAvailability = () => {
    if (!editingSlot) return;
    
    updateAvailabilityMutation.mutate({
      id: editingSlot.id,
      data: editingSlot,
    });
  };

  const handleDeleteAvailability = (id: string) => {
    if (confirm('Are you sure you want to delete this availability slot?')) {
      deleteAvailabilityMutation.mutate(id);
    }
  };

  const handleToggleAvailability = (slot: AvailabilitySlot) => {
    updateAvailabilityMutation.mutate({
      id: slot.id,
      data: { isAvailable: !slot.isAvailable },
    });
  };

  // Utility functions
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minute} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const groupAvailabilityByDate = (slots: AvailabilitySlot[]) => {
    return slots.reduce((groups, slot) => {
      const date = slot.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(slot);
      return groups;
    }, {} as Record<string, AvailabilitySlot[]>);
  };

  // Helper for updating new availability with nested patterns
  const updateNewAvailability = (updates: Partial<NewAvailabilityData>) => {
    setNewAvailability(prev => ({ ...prev, ...updates }));
  };

  const updateNewAvailabilityPattern = (
    patternUpdates: Partial<NonNullable<NewAvailabilityData['recurringPattern']>>
  ) => {
    setNewAvailability(prev => ({
      ...prev,
      recurringPattern: {
        ...prev.recurringPattern,
        frequency: prev.recurringPattern?.frequency || 'weekly',
        interval: 1,
        ...patternUpdates,
      }
    }));
  };

  // Helper for updating editing slot
  const updateEditingSlot = (updates: Partial<AvailabilitySlot>) => {
    setEditingSlot(prev => prev ? ({ ...prev, ...updates }) : null);
  };

  return {
    // State
    showAddDialog,
    setShowAddDialog,
    editingSlot,
    setEditingSlot,
    newAvailability,
    setNewAvailability: updateNewAvailability,
    
    // Data
    availability,
    isLoading,
    error,
    
    // Stats
    availableSlots,
    recurringSlots,
    totalSlots,
    
    // Actions
    handleAddAvailability,
    handleUpdateAvailability,
    handleDeleteAvailability,
    handleToggleAvailability,
    resetForm,
    refetch,
    
    // Loading states
    isCreating,
    isUpdating,
    isDeleting,
    isProcessing,
    
    // Utilities
    formatTime,
    formatDate,
    groupAvailabilityByDate,
    
    // Extended helpers (for complex nested updates)
    updateNewAvailabilityPattern,
    updateEditingSlot,
    TIME_SLOTS,
  };
}