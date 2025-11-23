import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { STALE_TIME, GC_TIME } from "@/lib/constants/react-query";
import { toast } from "sonner";
import { MentaraApiError } from "@/lib/api/errorHandler";
import type {
  PatientData,
  TherapistWorksheetAssignment,
} from "../../types/domain";
import type { Session } from "@/types/api/sessions";

/**
 * Hook for fetching assigned patients list (for therapists)
 */
export function usePatientsList() {
  const api = useApi();

  return useQuery({
    queryKey: queryKeys.therapists.patients.list(),
    queryFn: () => api.therapists.patients.getList(),
    select: (response) => response || [],
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: MentaraApiError) => {
      // Don't retry if not authorized to access patient data
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function usePatientsRequests() {
  const api = useApi();

  console.log("Fetching patient requests...");

  return useQuery({
    queryKey: [...queryKeys.therapists.patients.list(), "requests"],
    queryFn: () => api.therapists.patients.getRequests(),
    select: (response) => response || [],
    staleTime: STALE_TIME.SHORT, // 2 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: MentaraApiError) => {
      // Don't retry if not authorized to access patient data
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useAcceptPatientRequest() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientId: string) =>
      api.therapists.patients.acceptRequest(patientId),
    onSuccess: () => {
      // Invalidate both lists to refresh data
      queryClient.invalidateQueries({ queryKey: [...queryKeys.therapists.patients.list(), "requests"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.therapists.patients.list() });
    },
    onError: (error: MentaraApiError) => {
      console.error("Failed to accept patient request:", error);
    },
  });
}

export function useDenyPatientRequest() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientId: string) =>
      api.therapists.patients.denyRequest(patientId),
    onSuccess: () => {
      // Invalidate requests list to refresh data
      queryClient.invalidateQueries({ queryKey: [...queryKeys.therapists.patients.list(), "requests"] });
    },
    onError: (error: MentaraApiError) => {
      console.error("Failed to deny patient request:", error);
    },
  });
}

export function useRemovePatient() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientId: string) =>
      api.therapists.patients.removePatient(patientId),
    onSuccess: () => {
      // Invalidate both lists to refresh data
      queryClient.invalidateQueries({ queryKey: ["clients", "assigned"] });
      queryClient.invalidateQueries({ queryKey: ["clients", "requests"] });
    },
    onError: (error: MentaraApiError) => {
      console.error("Failed to remove patient:", error);
    },
  });
}

/**
 * Hook for fetching specific patient details
 */
export function usePatientData(patientId: string | null) {
  const api = useApi();

  return useQuery({
    queryKey: [...queryKeys.therapists.patients.list(), "detail", patientId || ""],
    queryFn: () => api.therapists.patients.getById(patientId!),
    select: (response) => response.data || null,
    enabled: !!patientId,
    staleTime: STALE_TIME.LONG, // 10 minutes
    gcTime: GC_TIME.VERY_LONG, // 30 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching patient sessions
 */
export function usePatientSessions(patientId: string | null) {
  const api = useApi();

  return useQuery({
    queryKey: [...queryKeys.therapists.patients.list(), "sessions", patientId || ""],
    queryFn: () => api.therapists.patients.getSessions(patientId!),
    select: (response) => response.data || [],
    enabled: !!patientId,
    staleTime: STALE_TIME.MEDIUM, // 5 minutes
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching patient worksheets
 */
export function usePatientWorksheets(patientId: string | null) {
  const api = useApi();

  return useQuery({
    queryKey: [...queryKeys.therapists.patients.list(), "detail", patientId || "", "worksheets"],
    queryFn: () => api.therapists.patients.getWorksheets(patientId!),
    select: (response) => response.data || [],
    enabled: !!patientId,
    staleTime: STALE_TIME.SHORT, // 3 minutes (uses SHORT for frequent changes)
    gcTime: GC_TIME.MEDIUM, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for updating patient session notes
 */
export function useUpdatePatientNotes() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      sessionId,
      notes,
    }: {
      patientId: string;
      sessionId: string;
      notes: string;
    }) => api.therapists.patients.updateNotes(patientId, sessionId, notes),
    onMutate: async ({ patientId, sessionId, notes }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: [...queryKeys.therapists.patients.list(), "sessions", patientId],
      });

      // Optimistically update session notes
      queryClient.setQueryData(
        [...queryKeys.therapists.patients.list(), "sessions", patientId],
        (oldSessions: Session[] | undefined) => {
          if (!oldSessions) return oldSessions;

          return oldSessions.map((session) =>
            session.id === sessionId ? { ...session, notes } : session
          );
        }
      );

      return { patientId, sessionId };
    },
    onError: (error: MentaraApiError, variables, context) => {
      toast.error(error?.message || "Failed to update session notes");

      // Revert optimistic update
      if (context?.patientId) {
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.therapists.patients.list(), "sessions", context.patientId],
        });
      }
    },
    onSuccess: (data, { patientId }) => {
      toast.success("Session notes updated successfully!");

      // Invalidate patient details to reflect changes
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.therapists.patients.list(), "detail", patientId],
      });
    },
  });
}

/**
 * Hook for assigning a worksheet to a patient
 */
export function useAssignWorksheet() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      worksheetData,
    }: {
      patientId: string;
      worksheetData: TherapistWorksheetAssignment;
    }) => api.therapists.patients.assignWorksheet(patientId, worksheetData),
    onSuccess: (data, { patientId }) => {
      toast.success("Worksheet assigned successfully!");

      // Invalidate patient worksheets
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.therapists.patients.list(), "detail", patientId, "worksheets"],
      });

      // Invalidate patient details
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.therapists.patients.list(), "detail", patientId],
      });
    },
    onError: (error: MentaraApiError) => {
      toast.error(error?.message || "Failed to assign worksheet");
    },
  });
}

/**
 * Hook for getting patient progress data
 */
export function usePatientProgress(patientId: string | null) {
  const api = useApi();

  return useQuery({
    queryKey: [...queryKeys.therapists.patients.list(), "progress", patientId || ""],
    queryFn: () => api.clients.getProgress(patientId!),
    select: (response) => response.data || null,
    enabled: !!patientId,
    staleTime: STALE_TIME.LONG, // 10 minutes
    gcTime: GC_TIME.VERY_LONG, // 30 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for prefetching patient data (for hover states, quick navigation)
 */
export function usePrefetchPatientData() {
  const queryClient = useQueryClient();
  const api = useApi();

  return (patientId: string) => {
    queryClient.prefetchQuery({
      queryKey: [...queryKeys.therapists.patients.list(), "detail", patientId],
      queryFn: () => api.therapists.patients.getById(patientId),
      staleTime: STALE_TIME.LONG, // 10 minutes
      gcTime: GC_TIME.VERY_LONG, // 30 minutes
    });
  };
}

/**
 * Backward compatibility hook - use usePatientsList instead
 * @deprecated Use usePatientsList instead
 */
export function usePatientsData() {
  const { data, isLoading, error } = usePatientsList();

  return {
    isLoading,
    error,
    patients: data || [],
  };
}
