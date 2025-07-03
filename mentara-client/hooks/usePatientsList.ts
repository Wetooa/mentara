import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';
import type { PatientData } from '@/lib/api/services/therapists';

/**
 * Hook for fetching assigned patients list (for therapists)
 */
export function usePatientsList() {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.clients.assigned,
    queryFn: () => api.therapists.patients.getList(),
    staleTime: 1000 * 60 * 5, // Patient list is relatively stable
    retry: (failureCount, error: any) => {
      // Don't retry if not authorized to access patient data
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for fetching specific patient details
 */
export function usePatientData(patientId: string | null) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.clients.detail(patientId || ''),
    queryFn: () => api.therapists.patients.getById(patientId!),
    enabled: !!patientId,
    staleTime: 1000 * 60 * 10, // Patient details change less frequently
  });
}

/**
 * Hook for fetching patient sessions
 */
export function usePatientSessions(patientId: string | null) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.clients.sessions(patientId || ''),
    queryFn: () => api.therapists.patients.getSessions(patientId!),
    enabled: !!patientId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook for fetching patient worksheets
 */
export function usePatientWorksheets(patientId: string | null) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.clients.detail(patientId || '').concat(['worksheets']),
    queryFn: () => api.therapists.patients.getWorksheets(patientId!),
    enabled: !!patientId,
    staleTime: 1000 * 60 * 3, // Worksheets may change more frequently
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
      notes 
    }: { 
      patientId: string; 
      sessionId: string; 
      notes: string; 
    }) => api.therapists.patients.updateNotes(patientId, sessionId, notes),
    onMutate: async ({ patientId, sessionId, notes }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.clients.sessions(patientId) 
      });
      
      // Optimistically update session notes
      queryClient.setQueryData(
        queryKeys.clients.sessions(patientId),
        (oldSessions: any[]) => {
          if (!oldSessions) return oldSessions;
          
          return oldSessions.map(session => 
            session.id === sessionId ? { ...session, notes } : session
          );
        }
      );
      
      return { patientId, sessionId };
    },
    onError: (error: any, variables, context) => {
      toast.error(error?.message || 'Failed to update session notes');
      
      // Revert optimistic update
      if (context?.patientId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.clients.sessions(context.patientId) 
        });
      }
    },
    onSuccess: (data, { patientId }) => {
      toast.success('Session notes updated successfully!');
      
      // Invalidate patient details to reflect changes
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.clients.detail(patientId) 
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
      worksheetData 
    }: { 
      patientId: string; 
      worksheetData: any; 
    }) => api.therapists.patients.assignWorksheet(patientId, worksheetData),
    onSuccess: (data, { patientId }) => {
      toast.success('Worksheet assigned successfully!');
      
      // Invalidate patient worksheets
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.clients.detail(patientId).concat(['worksheets']) 
      });
      
      // Invalidate patient details
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.clients.detail(patientId) 
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to assign worksheet');
    },
  });
}

/**
 * Hook for getting patient progress data
 */
export function usePatientProgress(patientId: string | null) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.clients.progress(patientId || ''),
    queryFn: () => api.clients.getProgress(patientId!),
    enabled: !!patientId,
    staleTime: 1000 * 60 * 10, // Progress data changes slowly
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
      queryKey: queryKeys.clients.detail(patientId),
      queryFn: () => api.therapists.patients.getById(patientId),
      staleTime: 1000 * 60 * 10,
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