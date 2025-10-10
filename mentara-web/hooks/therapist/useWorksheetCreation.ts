import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { toast } from 'sonner';
import { z } from 'zod';

const worksheetSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  instructions: z
    .string()
    .min(10, 'Instructions must be at least 10 characters')
    .max(2000, 'Instructions must be less than 2000 characters'),
  dueDate: z.date().optional(),
});

type WorksheetFormData = z.infer<typeof worksheetSchema>;

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  assessmentInfo?: {
    hasAssessment: boolean;
    assessmentType: string;
  };
}

interface UseWorksheetCreationReturn {
  // Form state
  register: any;
  handleSubmit: any;
  watch: any;
  setValue: any;
  errors: any;
  isValid: boolean;
  reset: () => void;
  
  // Form values
  selectedDueDate: Date | undefined;
  titleLength: number;
  instructionsLength: number;
  
  // Calendar state
  dueDateOpen: boolean;
  setDueDateOpen: (open: boolean) => void;
  
  // Actions
  onSubmit: (data: WorksheetFormData) => void;
  
  // Loading state
  isCreating: boolean;
  
  // Validation helpers
  getTitleLengthColor: () => string;
  getInstructionsLengthColor: () => string;
}

export function useWorksheetCreation(
  client: Client,
  onSuccess?: () => void,
  onCancel?: () => void
): UseWorksheetCreationReturn {
  const api = useApi();
  const queryClient = useQueryClient();
  const [dueDateOpen, setDueDateOpen] = useState(false);

  const form = useForm<WorksheetFormData>({
    resolver: zodResolver(worksheetSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      instructions: '',
      dueDate: undefined,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = form;

  const selectedDueDate = watch('dueDate');
  const titleLength = watch('title')?.length || 0;
  const instructionsLength = watch('instructions')?.length || 0;

  // Mutation for creating worksheet
  const createWorksheetMutation = useMutation({
    mutationFn: async (data: WorksheetFormData) => {
      const response = await api.apiClient.post(
        `/therapist/clients/${client.id}/worksheets`,
        {
          title: data.title,
          instructions: data.instructions,
          dueDate: data.dueDate?.toISOString(),
        }
      );
      return response.data;
    },
    onSuccess: (result) => {
      toast.success('Worksheet assigned successfully!');
      queryClient.invalidateQueries({ queryKey: ['therapist', 'worksheets'] });
      queryClient.invalidateQueries({ queryKey: ['therapist', 'matched-clients'] });
      reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to assign worksheet';
      toast.error(message);
    },
  });

  const onSubmit = (data: WorksheetFormData) => {
    createWorksheetMutation.mutate(data);
  };

  // Utility functions for validation styling
  const getTitleLengthColor = (): string => {
    if (errors.title) return 'text-red-500';
    if (titleLength > 200) return 'text-red-500';
    if (titleLength > 180) return 'text-yellow-600';
    return 'text-muted-foreground';
  };

  const getInstructionsLengthColor = (): string => {
    if (errors.instructions) return 'text-red-500';
    if (instructionsLength > 2000) return 'text-red-500';
    if (instructionsLength > 1800) return 'text-yellow-600';
    return 'text-muted-foreground';
  };

  return {
    // Form state
    register,
    handleSubmit,
    watch,
    setValue,
    errors,
    isValid,
    reset,
    
    // Form values
    selectedDueDate,
    titleLength,
    instructionsLength,
    
    // Calendar state
    dueDateOpen,
    setDueDateOpen,
    
    // Actions
    onSubmit,
    
    // Loading state
    isCreating: createWorksheetMutation.isPending,
    
    // Validation helpers
    getTitleLengthColor,
    getInstructionsLengthColor,
  };
}