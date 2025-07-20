import React from "react";
import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useApi } from "@/lib/api";

import type {
  TherapistRecommendationResponse,
  TherapistSearchParams,
  TherapistRecommendation,
} from "@/lib/api/services/therapists";
import { 
  TherapistCardData,
  transformTherapistForCard 
} from "@/types/therapist";
import { TherapistFilters } from "@/types/filters";

/**
 * Core hook for fetching therapist recommendations with search/filter parameters
 */
export function useTherapistRecommendations(
  params: TherapistSearchParams = {}
) {
  const api = useApi();

  return useQuery({
    queryKey: ['therapists', 'recommendations', params],
    queryFn: (): Promise<TherapistRecommendationResponse> => {
      return api.therapists.getRecommendations(params);
    },
    select: (response) => response.data || { therapists: [], totalCount: 0 },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching a specific therapist profile
 */
export function useTherapistProfile(therapistId: string | null) {
  const api = useApi();

  return useQuery({
    queryKey: ['therapists', 'detail', therapistId || ""],
    queryFn: () => api.therapists.getProfile(therapistId!),
    enabled: !!therapistId,
    staleTime: 1000 * 60 * 10, // Profile data is more stable
  });
}

/**
 * Hook for infinite scroll therapist recommendations
 */
export function useInfiniteTherapistRecommendations(
  baseParams: Omit<TherapistSearchParams, "offset"> = {}
) {
  const api = useApi();

  return useInfiniteQuery({
    queryKey: queryKeys.therapists.recommendations({
      ...baseParams,
      infinite: true,
    }),
    queryFn: ({ pageParam = 0 }) =>
      api.therapists.getRecommendations({
        ...baseParams,
        offset: pageParam,
        limit: baseParams.limit || 10,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.length * (baseParams.limit || 10);
      return lastPage.hasMore ? totalLoaded : undefined;
    },
    enabled: true,
  });
}

/**
 * Hook that transforms API data to card format for UI compatibility
 */
export function useTherapistCards(params: TherapistSearchParams = {}) {
  const { data, error, isLoading, refetch } = useTherapistRecommendations(params);

  const therapistCards: TherapistCardData[] = data?.therapists?.map(transformTherapistForCard) || [];

  return {
    therapists: therapistCards,
    totalCount: data?.totalCount || 0,
    userConditions: data?.userConditions || [],
    matchCriteria: data?.matchCriteria,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for filtering therapists with hybrid server/client-side filtering and pagination
 * Used primarily by TherapistListing and FavoritesSection components
 * 
 * FIXED: Removed over-fetching pattern and improved filtering efficiency
 * - Uses server-side filtering for province and price when available
 * - Implements proper pagination with awareness of client-side filtering
 * - Fetches larger batches intelligently based on filter complexity
 */
export function useFilteredTherapists(
  searchQuery: string,
  filter: string,
  params: TherapistSearchParams & { 
    page?: number; 
    pageSize?: number; 
    advancedFilters?: TherapistFilters;
  } = {}
) {
  const { page = 1, pageSize = 20, advancedFilters, ...searchParams } = params;
  
  // Build server-side filter parameters from advanced filters
  const serverSideParams = React.useMemo(() => {
    const baseParams = { ...searchParams };
    
    if (advancedFilters) {
      // Use server-side province filter if available
      if (advancedFilters.location) {
        baseParams.province = advancedFilters.location;
      }
      
      // Use server-side price filter if available  
      if (advancedFilters.priceRange?.max && advancedFilters.priceRange.max < 1000) {
        baseParams.maxHourlyRate = advancedFilters.priceRange.max;
      }
    }
    
    return baseParams;
  }, [searchParams, advancedFilters]);

  // Determine how much data to fetch based on filter complexity
  // More complex filters = need more data to ensure we have enough results after filtering
  const fetchLimit = React.useMemo(() => {
    const hasClientSideFilters = 
      searchQuery || 
      filter !== "All" || 
      (advancedFilters && (
        advancedFilters.specialties.length > 0 ||
        advancedFilters.rating > 0 ||
        advancedFilters.experienceLevel?.min > 0 ||
        advancedFilters.languages.length > 0 ||
        Object.values(advancedFilters.availability || {}).some(Boolean)
      ));
    
    // Fetch larger batches if we need client-side filtering, but not excessively
    return hasClientSideFilters ? Math.min(pageSize * 2, 50) : pageSize;
  }, [pageSize, searchQuery, filter, advancedFilters]);

  const { therapists, isLoading, error, refetch, totalCount, userConditions, matchCriteria } = useTherapistCards({
    ...serverSideParams,
    limit: fetchLimit,
  });

  // Memoized client-side filtering logic to avoid unnecessary recalculations
  const filteredTherapists = React.useMemo(() => {
    return therapists.filter((therapist) => {
      // Basic search filter
      const matchesSearch =
        searchQuery === "" ||
        therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        therapist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        therapist.specialties.some((specialty) =>
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Basic category filter
      const matchesFilter =
        filter === "All" ||
        therapist.specialties.some((specialty) => specialty === filter);

      // Advanced filters application (only those not handled server-side)
      if (advancedFilters) {
        // Specialties filter (client-side)
        if (advancedFilters.specialties.length > 0) {
          const hasMatchingSpecialty = advancedFilters.specialties.some(filterSpecialty =>
            therapist.specialties.some(therapistSpecialty =>
              therapistSpecialty.toLowerCase().includes(filterSpecialty.toLowerCase())
            )
          );
          if (!hasMatchingSpecialty) return false;
        }

        // Price range filter (client-side for min price, server handles max)
        if (advancedFilters.priceRange?.min > 0) {
          const therapistPrice = parseFloat(therapist.sessionPrice.replace('$', ''));
          if (therapistPrice < advancedFilters.priceRange.min) {
            return false;
          }
        }

        // Location filter (client-side refinement of server-side filter)
        if (advancedFilters.location && therapist.location) {
          if (!therapist.location.toLowerCase().includes(advancedFilters.location.toLowerCase())) {
            return false;
          }
        }

        // Rating filter (client-side)
        if (advancedFilters.rating > 0 && therapist.rating < advancedFilters.rating) {
          return false;
        }

        // Experience filter (client-side)
        if (advancedFilters.experienceLevel) {
          if (therapist.experience < advancedFilters.experienceLevel.min || 
              therapist.experience > advancedFilters.experienceLevel.max) {
            return false;
          }
        }

        // Language filter (client-side)
        if (advancedFilters.languages.length > 0 && therapist.languages) {
          const hasMatchingLanguage = advancedFilters.languages.some(filterLang =>
            therapist.languages?.some((therapistLang: string) =>
              therapistLang.toLowerCase().includes(filterLang.toLowerCase())
            )
          );
          if (!hasMatchingLanguage) return false;
        }

        // Availability filter (client-side)
        if (advancedFilters.availability && Object.values(advancedFilters.availability).some(Boolean)) {
          if (!therapist.isActive) return false;
        }
      }

      return matchesSearch && matchesFilter;
    });
  }, [therapists, searchQuery, filter, advancedFilters]);

  // Client-side pagination with proper bounds checking
  const paginationData = React.useMemo(() => {
    const totalFilteredCount = filteredTherapists.length;
    const totalPages = Math.ceil(totalFilteredCount / pageSize);
    const safePage = Math.min(Math.max(1, page), Math.max(1, totalPages));
    
    const startIndex = (safePage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTherapists = filteredTherapists.slice(startIndex, endIndex);
    
    return {
      therapists: paginatedTherapists,
      totalCount: totalFilteredCount,
      totalPages,
      currentPage: safePage,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
      // Indicate if we might have more results on the server
      mayHaveMoreResults: filteredTherapists.length >= fetchLimit && totalPages <= 1,
    };
  }, [filteredTherapists, page, pageSize, fetchLimit]);

  return {
    ...paginationData,
    pageSize,
    userConditions,
    matchCriteria,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for prefetching therapist profiles (hover states, etc.)
 */
export function usePrefetchTherapistProfile() {
  const queryClient = useQueryClient();
  const api = useApi();

  return (therapistId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['therapists', 'detail', therapistId],
      queryFn: () => api.therapists.getProfile(therapistId),
      staleTime: 1000 * 60 * 10,
    });
  };
}

/**
 * Hook for search and cache management utilities
 */
export function useTherapistSearch() {
  const queryClient = useQueryClient();
  const api = useApi();

  const invalidateRecommendations = () => {
    queryClient.invalidateQueries({
      queryKey: ['therapists', 'recommendations'],
    });
  };

  const refetchWithParams = (params: TherapistSearchParams) => {
    return queryClient.fetchQuery({
      queryKey: ['therapists', 'recommendations', params],
      queryFn: () => api.therapists.getRecommendations(params),
    });
  };

  return {
    invalidateRecommendations,
    refetchWithParams,
  };
}