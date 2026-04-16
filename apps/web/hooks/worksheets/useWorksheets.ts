import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME, GC_TIME } from "@/lib/constants/react-query";
import { toast } from "sonner";
import { MentaraApiError } from "@/lib/api/errorHandler";

interface Worksheet {
  id: string;
  title: string;
  description: string;
  type: 'assessment' | 'exercise' | 'homework';
  status: 'assigned' | 'in-progress' | 'completed' | 'overdue';
  assignedBy: string;
  assignedAt: string;
  dueDate?: string;
  completedAt?: string;
  content: Record<string, any>;
  responses?: Record<string, any>;
}

/**
 * Hook for managing worksheets (for clients)
 */
export function useWorksheets() {
  const api = useApi();
  const queryClient = useQueryClient();

  // Get worksheets
  const {
    data: worksheets,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.worksheets.my(),
    queryFn: () => api.worksheets.getMy(),
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
  });

  // Submit worksheet responses
  const submitResponsesMutation = useMutation({
    mutationFn: ({ worksheetId, responses }: { worksheetId: string; responses: Record<string, any> }) =>
      api.worksheets.submitResponses(worksheetId, responses),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.worksheets.all });
      toast.success("Worksheet submitted successfully");
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to submit worksheet");
    },
  });

  // Save draft responses
  const saveDraftMutation = useMutation({
    mutationFn: ({ worksheetId, responses }: { worksheetId: string; responses: Record<string, any> }) =>
      api.worksheets.saveDraft(worksheetId, responses),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.worksheets.all });
    },
    onError: (error: MentaraApiError) => {
      console.error("Failed to save draft:", error);
    },
  });

  return {
    worksheets: worksheets || [],
    isLoading,
    error,
    refetch,
    submitResponses: (worksheetId: string, responses: Record<string, any>) =>
      submitResponsesMutation.mutate({ worksheetId, responses }),
    saveDraft: (worksheetId: string, responses: Record<string, any>) =>
      saveDraftMutation.mutate({ worksheetId, responses }),
    isSubmitting: submitResponsesMutation.isPending,
    isSavingDraft: saveDraftMutation.isPending,
  };
}

/**
 * Hook for managing worksheets (for therapists)
 */
export function useTherapistWorksheets() {
  const api = useApi();
  const queryClient = useQueryClient();

  // Get assigned worksheets for patients
  const {
    data: worksheets,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.worksheets.assigned(),
    queryFn: () => api.worksheets.getAssigned(),
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
  });

  // Assign worksheet to patient
  const assignWorksheetMutation = useMutation({
    mutationFn: ({ patientId, worksheetData }: { patientId: string; worksheetData: Partial<Worksheet> }) =>
      api.worksheets.assign(patientId, worksheetData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.worksheets.all });
      toast.success("Worksheet assigned successfully");
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to assign worksheet");
    },
  });

  // Review worksheet responses
  const reviewResponsesMutation = useMutation({
    mutationFn: ({ worksheetId, feedback }: { worksheetId: string; feedback: string }) =>
      api.worksheets.reviewResponses(worksheetId, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.worksheets.all });
      toast.success("Review submitted successfully");
    },
    onError: (error: MentaraApiError) => {
      toast.error("Failed to submit review");
    },
  });

  return {
    worksheets: worksheets || [],
    isLoading,
    error,
    refetch,
    assignWorksheet: (patientId: string, worksheetData: Partial<Worksheet>) =>
      assignWorksheetMutation.mutate({ patientId, worksheetData }),
    reviewResponses: (worksheetId: string, feedback: string) =>
      reviewResponsesMutation.mutate({ worksheetId, feedback }),
    isAssigning: assignWorksheetMutation.isPending,
    isReviewing: reviewResponsesMutation.isPending,
  };
}