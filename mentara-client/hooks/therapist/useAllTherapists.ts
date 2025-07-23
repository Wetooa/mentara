import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { TherapistSearchParams } from "@/types/api/therapist";
import { 
  TherapistCardData,
  transformTherapistForCard 
} from "@/types/therapist";
import { TherapistFilters } from "@/types/filters";

/**
 * Hook for fetching ALL approved therapists (no personalization)
 * This hook ALWAYS calls the /therapists endpoint to ensure all therapists are displayed
 * Best for: Main therapist listing page, browse all functionality
 */
export function useAllTherapists(params: TherapistSearchParams & {
  page?: number;
  pageSize?: number;
  advancedFilters?: TherapistFilters;
} = {}) {
  const api = useApi();
  const { page = 1, pageSize = 20, advancedFilters, ...searchParams } = params;

  // Build API parameters for server-side filtering
  const apiParams = React.useMemo(() => {
    const baseParams = { ...searchParams };
    
    // Server-side pagination
    baseParams.limit = pageSize;
    baseParams.offset = (page - 1) * pageSize;
    
    // Server-side filters (when supported by backend)
    if (advancedFilters) {
      if (advancedFilters.location) {
        baseParams.province = advancedFilters.location;
      }
      if (advancedFilters.priceRange?.max && advancedFilters.priceRange.max < 1000) {
        baseParams.maxHourlyRate = advancedFilters.priceRange.max;
      }
    }
    
    return baseParams;
  }, [searchParams, advancedFilters, page, pageSize]);

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: queryKeys.therapists.list(apiParams),
    queryFn: async () => {
      const response = await api.therapists.getAllTherapists(apiParams);
      return response.data || { therapists: [], totalCount: 0, currentPage: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false };
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Transform API data to card format for UI compatibility
  const therapistCards: TherapistCardData[] = React.useMemo(() => {
    return data?.therapists?.map(transformTherapistForCard) || [];
  }, [data?.therapists]);

  return {
    therapists: therapistCards,
    totalCount: data?.totalCount || 0,
    currentPage: data?.currentPage || page,
    totalPages: data?.totalPages || 1,
    hasNextPage: data?.hasNextPage || false,
    hasPreviousPage: data?.hasPreviousPage || false,
    pageSize,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for fetching all therapists with client-side filtering and search
 * This version combines server-side pagination with client-side filtering for better UX
 */
export function useAllTherapistsWithFilters(
  searchQuery: string = "",
  selectedFilter: string = "All",
  advancedFilters: TherapistFilters = {
    specialties: [],
    location: "",
    priceRange: { min: 0, max: 1000 },
    rating: 0,
    experienceLevel: { min: 0, max: 50 },
    languages: [],
    availability: {},
  },
  params: {
    page?: number;
    pageSize?: number;
  } = {}
) {
  const { page = 1, pageSize = 20 } = params;
  
  // Fetch more data than needed for client-side filtering
  const fetchSize = Math.min(pageSize * 3, 100); // Fetch 3x the page size but cap at 100
  
  const { 
    therapists: allTherapists, 
    totalCount: serverTotalCount,
    isLoading, 
    error, 
    refetch 
  } = useAllTherapists({
    page: 1, // Always fetch from page 1 for client-side filtering
    pageSize: fetchSize,
    advancedFilters,
  });

  // Client-side filtering logic
  const filteredTherapists = React.useMemo(() => {
    return allTherapists.filter((therapist) => {
      // Basic search filter
      const matchesSearch =
        searchQuery === "" ||
        therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        therapist.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        therapist.specialties?.some((specialty) =>
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Basic category filter
      const matchesFilter =
        selectedFilter === "All" ||
        therapist.specialties?.some((specialty) => specialty === selectedFilter);

      // Advanced filters
      if (advancedFilters) {
        // Specialties filter
        if (advancedFilters.specialties.length > 0) {
          const hasMatchingSpecialty = advancedFilters.specialties.some(filterSpecialty =>
            therapist.specialties?.some(therapistSpecialty =>
              therapistSpecialty.toLowerCase().includes(filterSpecialty.toLowerCase())
            )
          );
          if (!hasMatchingSpecialty) return false;
        }

        // Price range filter (client-side for min price, server handles max)
        if (advancedFilters.priceRange?.min > 0) {
          const therapistPrice = parseFloat(therapist.sessionPrice?.replace('$', '') || '0');
          if (therapistPrice < advancedFilters.priceRange.min) {
            return false;
          }
        }

        // Location filter (client-side refinement)
        if (advancedFilters.location && therapist.location) {
          if (!therapist.location.toLowerCase().includes(advancedFilters.location.toLowerCase())) {
            return false;
          }
        }

        // Rating filter
        if (advancedFilters.rating > 0 && therapist.rating < advancedFilters.rating) {
          return false;
        }

        // Experience filter
        if (advancedFilters.experienceLevel) {
          if (therapist.experience < advancedFilters.experienceLevel.min || 
              therapist.experience > advancedFilters.experienceLevel.max) {
            return false;
          }
        }

        // Language filter
        if (advancedFilters.languages.length > 0 && therapist.languages) {
          const hasMatchingLanguage = advancedFilters.languages.some(filterLang =>
            therapist.languages?.some((therapistLang: string) =>
              therapistLang.toLowerCase().includes(filterLang.toLowerCase())
            )
          );
          if (!hasMatchingLanguage) return false;
        }

        // Availability filter
        if (advancedFilters.availability && Object.values(advancedFilters.availability).some(Boolean)) {
          if (!therapist.isActive) return false;
        }
      }

      return matchesSearch && matchesFilter;
    });
  }, [allTherapists, searchQuery, selectedFilter, advancedFilters]);

  // Client-side pagination
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
    };
  }, [filteredTherapists, page, pageSize]);

  return {
    ...paginationData,
    pageSize,
    isLoading,
    error,
    refetch,
  };
}

export default useAllTherapists;