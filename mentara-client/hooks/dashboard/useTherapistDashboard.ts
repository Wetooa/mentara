import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import type { TherapistDashboardResponseDto } from 'mentara-commons';

/**
 * Hook for fetching therapist-specific dashboard data
 */
export function useTherapistDashboard() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['dashboard', 'therapist'],
    queryFn: () => api.dashboard?.getTherapistDashboard?.() || Promise.resolve({} as TherapistDashboardResponseDto),
    staleTime: 1000 * 60 * 2, // Consider fresh for 2 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if not authorized
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
    enabled: !!api.dashboard?.getTherapistDashboard, // Only if dashboard service is available
  });
}

/**
 * Hook for fetching therapist patient list and stats
 */
export function useTherapistPatients() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['dashboard', 'therapist', 'patients'],
    queryFn: () => api.dashboard?.getTherapistPatients?.() || Promise.resolve([]),
    staleTime: 1000 * 60 * 5, // Patient data changes less frequently
    enabled: !!api.dashboard?.getTherapistPatients,
  });
}

/**
 * Hook for fetching therapist schedule and appointments
 */
export function useTherapistSchedule() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['dashboard', 'therapist', 'schedule'],
    queryFn: () => api.dashboard?.getTherapistSchedule?.() || Promise.resolve([]),
    staleTime: 1000 * 60 * 3, // Schedule changes more frequently
    enabled: !!api.dashboard?.getTherapistSchedule,
  });
}

/**
 * Hook for fetching therapist performance metrics
 */
export function useTherapistMetrics() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['dashboard', 'therapist', 'metrics'],
    queryFn: () => api.dashboard?.getTherapistMetrics?.() || Promise.resolve({}),
    staleTime: 1000 * 60 * 15, // Metrics change slowly
    enabled: !!api.dashboard?.getTherapistMetrics,
  });
}

/**
 * Hook for fetching therapist earnings and revenue
 */
export function useTherapistEarnings() {
  const api = useApi();
  
  return useQuery({
    queryKey: ['dashboard', 'therapist', 'earnings'],
    queryFn: () => api.dashboard?.getTherapistEarnings?.() || Promise.resolve({}),
    staleTime: 1000 * 60 * 10, // Earnings data changes moderately
    enabled: !!api.dashboard?.getTherapistEarnings,
  });
}