// This file is deprecated - use useTherapistDashboard instead
// Kept for backward compatibility during migration

import { useTherapistDashboard } from './useTherapistDashboard';

/**
 * @deprecated Use useTherapistDashboard instead
 * This hook is kept for backward compatibility during the migration from mock data
 */
export function useTherapistData() {
  const { data, isLoading, error } = useTherapistDashboard();

  return {
    isLoading,
    error,
    therapist: data?.therapist || { id: '', name: '', avatar: '' },
    stats: data?.stats || { 
      activePatients: 0, 
      rescheduled: 0, 
      cancelled: 0, 
      income: 0,
      patientStats: {
        total: 0,
        percentage: 0,
        months: 0,
        chartData: []
      }
    },
    upcomingAppointments: data?.upcomingAppointments || [],
  };
}
