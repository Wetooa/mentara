// This file is deprecated - use usePatientData from usePatientsList instead
// Kept for backward compatibility during migration

import { usePatientData as usePatientDataNew } from './usePatientsList';
import type { PatientData } from '@/lib/api/services/therapists';

/**
 * @deprecated Use usePatientData from usePatientsList instead
 * This hook is kept for backward compatibility during the migration from mock data
 */
export function usePatientData(patientId: string) {
  const { data: patient, isLoading, error } = usePatientDataNew(patientId);

  // Function to refresh patient data (now handled by React Query)
  const refreshPatient = async () => {
    // No-op - React Query handles refetching
  };

  // Function to update patient data optimistically (now handled by React Query mutations)
  const updatePatient = (updates: Partial<PatientData>) => {
    // No-op - mutations should use React Query hooks
  };

  return { 
    isLoading, 
    error, 
    patient, 
    refreshPatient, 
    updatePatient 
  };
}