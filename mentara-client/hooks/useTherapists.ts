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
  transformTherapistForCard,
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
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    queryKey: ['therapists', 'recommendations', {
      ...baseParams,
      infinite: true,
    }],
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
  const { data, error, isLoading, refetch } =
    useTherapistRecommendations(params);

  const therapistCards: TherapistCardData[] =
    data?.therapists?.map(transformTherapistForCard) || [];

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
 * Hook for filtering therapists with advanced client-side filtering and pagination
 * Used primarily by TherapistListing and FavoritesSection components
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

  const {
    therapists,
    isLoading,
    error,
    refetch,
    totalCount,
    userConditions,
    matchCriteria,
  } = useTherapistCards({
    ...searchParams,
    limit: pageSize * 3, // Fetch more data to handle client-side filtering
  });

  // Client-side filtering logic
  const filteredTherapists = therapists.filter((therapist) => {
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

    // Advanced filters application
    if (advancedFilters) {
      // Specialties filter
      if (advancedFilters.specialties.length > 0) {
        const hasMatchingSpecialty = advancedFilters.specialties.some(
          (filterSpecialty) =>
            therapist.specialties.some((therapistSpecialty) =>
              therapistSpecialty
                .toLowerCase()
                .includes(filterSpecialty.toLowerCase())
            )
        );
        if (!hasMatchingSpecialty) return false;
      }

      // Price range filter
      const therapistPrice = parseFloat(
        therapist.sessionPrice.replace("$", "")
      );
      if (
        therapistPrice < advancedFilters.priceRange.min ||
        therapistPrice > advancedFilters.priceRange.max
      ) {
        return false;
      }

      // Location filter
      if (advancedFilters.location && therapist.location) {
        if (
          !therapist.location
            .toLowerCase()
            .includes(advancedFilters.location.toLowerCase())
        ) {
          return false;
        }
      }

      // Rating filter
      if (
        advancedFilters.rating > 0 &&
        therapist.rating < advancedFilters.rating
      ) {
        return false;
      }

      // Experience filter
      if (
        therapist.experience < advancedFilters.experienceLevel.min ||
        therapist.experience > advancedFilters.experienceLevel.max
      ) {
        return false;
      }

      // Language filter
      if (advancedFilters.languages.length > 0 && therapist.languages) {
        const hasMatchingLanguage = advancedFilters.languages.some(
          (filterLang) =>
            therapist.languages?.some((therapistLang: string) =>
              therapistLang.toLowerCase().includes(filterLang.toLowerCase())
            )
        );
        if (!hasMatchingLanguage) return false;
      }

      // Availability filter
      if (Object.values(advancedFilters.availability).some(Boolean)) {
        if (!therapist.isActive) return false;
      }
    }

    return matchesSearch && matchesFilter;
  });

  // Client-side pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTherapists = filteredTherapists.slice(startIndex, endIndex);

  const totalFilteredCount = filteredTherapists.length;
  const totalPages = Math.ceil(totalFilteredCount / pageSize);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    therapists: paginatedTherapists,
    totalCount: totalFilteredCount,
    totalPages,
    currentPage: page,
    pageSize,
    hasNextPage,
    hasPreviousPage,
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
