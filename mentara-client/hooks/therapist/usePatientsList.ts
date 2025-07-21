import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';

import { toast } from 'sonner';
import { MentaraApiError } from '@/lib/api/errorHandler';
import type { PatientData, TherapistWorksheetAssignment } from 'mentara-commons';
import type { Session } from '@/types/api/sessions';

/**
 * Hook for fetching assigned patients list (for therapists)
 */
export function usePatientsList() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['clients', 'assigned'],
    queryFn: () => api.therapists.patients.getList(),
    select: (response) => response.data || [],
    staleTime: 1000 * 60 * 5, // Patient list is relatively stable
    retry: (failureCount, error: MentaraApiError) => {
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
    queryKey: ['clients', 'detail', patientId || ''],
    queryFn: () => api.therapists.patients.getById(patientId!),
    select: (response) => response.data || null,
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
    queryKey: ['clients', 'sessions', patientId || ''],
    queryFn: () => api.therapists.patients.getSessions(patientId!),
    select: (response) => response.data || [],
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
    queryKey: ['clients', 'detail', patientId || '', 'worksheets'],
    queryFn: () => api.therapists.patients.getWorksheets(patientId!),
    select: (response) => response.data || [],
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
        queryKey: ['clients', 'sessions', patientId] 
      });
      
      // Optimistically update session notes
      queryClient.setQueryData(
        ['clients', 'sessions', patientId],
        (oldSessions: Session[] | undefined) => {
          if (!oldSessions) return oldSessions;
          
          return oldSessions.map(session => 
            session.id === sessionId ? { ...session, notes } : session
          );
        }
      );
      
      return { patientId, sessionId };
    },
    onError: (error: MentaraApiError, variables, context) => {
      toast.error(error?.message || 'Failed to update session notes');
      
      // Revert optimistic update
      if (context?.patientId) {
        queryClient.invalidateQueries({ 
          queryKey: ['clients', 'sessions', context.patientId] 
        });
      }
    },
    onSuccess: (data, { patientId }) => {
      toast.success('Session notes updated successfully!');
      
      // Invalidate patient details to reflect changes
      queryClient.invalidateQueries({ 
        queryKey: ['clients', 'detail', patientId] 
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
      worksheetData: TherapistWorksheetAssignment; 
    }) => api.therapists.patients.assignWorksheet(patientId, worksheetData),
    onSuccess: (data, { patientId }) => {
      toast.success('Worksheet assigned successfully!');
      
      // Invalidate patient worksheets
      queryClient.invalidateQueries({ 
        queryKey: ['clients', 'detail', patientId, 'worksheets'] 
      });
      
      // Invalidate patient details
      queryClient.invalidateQueries({ 
        queryKey: ['clients', 'detail', patientId] 
      });
    },
    onError: (error: MentaraApiError) => {
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
    queryKey: ['clients', 'progress', patientId || ''],
    queryFn: () => api.clients.getProgress(patientId!),
    select: (response) => response.data || null,
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
      queryKey: ['clients', 'detail', patientId],
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