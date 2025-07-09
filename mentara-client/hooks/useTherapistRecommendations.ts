import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type { 
  TherapistRecommendationResponse, 
  TherapistSearchParams,
  TherapistRecommendation 
} from '@/lib/api/services/therapists';

/**
 * Hook for fetching therapist recommendations with search/filter parameters
 */
export function useTherapistRecommendations(params: TherapistSearchParams = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.therapists.recommendations(params),
    queryFn: () => api.therapists.getRecommendations(params),
    select: (response) => response.data || null,
    enabled: true, // Always enabled since this is the main recommendations query
    staleTime: 1000 * 60 * 5, // Consider fresh for 5 minutes
  });
}

/**
 * Hook for fetching a specific therapist profile
 */
export function useTherapistProfile(therapistId: string | null) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.therapists.detail(therapistId || ''),
    queryFn: () => api.therapists.getProfile(therapistId!),
    select: (response) => response.data || null,
    enabled: !!therapistId,
    staleTime: 1000 * 60 * 10, // Profile data is more stable, cache for 10 minutes
  });
}

/**
 * Hook for infinite scroll therapist recommendations
 */
export function useInfiniteTherapistRecommendations(
  baseParams: Omit<TherapistSearchParams, 'offset'> = {}
) {
  const api = useApi();
  
  return useInfiniteQuery({
    queryKey: queryKeys.therapists.recommendations({ ...baseParams, infinite: true }),
    queryFn: ({ pageParam = 0 }) => 
      api.therapists.getRecommendations({ 
        ...baseParams, 
        offset: pageParam,
        limit: baseParams.limit || 10 
      }),
    select: (data) => ({
      pages: data.pages.map(page => page.data || {}),
      pageParams: data.pageParams,
    }),
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.length * (baseParams.limit || 10);
      return lastPage.data?.hasMore ? totalLoaded : undefined;
    },
    enabled: true,
  });
}

/**
 * Hook for prefetching a therapist profile (for hover states, etc.)
 */
export function usePrefetchTherapistProfile() {
  const queryClient = useQueryClient();
  const api = useApi();
  
  return (therapistId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.therapists.detail(therapistId),
      queryFn: () => api.therapists.getProfile(therapistId),
      staleTime: 1000 * 60 * 10,
    });
  };
}

/**
 * Hook for updating recommendation filters/search
 * This provides optimistic updates for better UX
 */
export function useTherapistSearch() {
  const queryClient = useQueryClient();
  const api = useApi();
  
  const invalidateRecommendations = () => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.therapists.recommendations({}) 
    });
  };
  
  const refetchWithParams = (params: TherapistSearchParams) => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.therapists.recommendations(params),
      queryFn: () => api.therapists.getRecommendations(params),
    });
  };
  
  return {
    invalidateRecommendations,
    refetchWithParams,
  };
}