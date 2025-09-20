import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { 
  TherapistCardData,
  transformTherapistForCard,
  ApiTherapistResponse
} from "@/types/therapist";

/**
 * Simple hook for fetching ALL approved therapists at once
 * This hook fetches ALL therapists without pagination limits
 * Best for: Main therapist listing page where you want to show all therapists
 */
export function useAllTherapists() {
  const api = useApi();

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: queryKeys.therapists.list({ all: true }),
    queryFn: async () => {
      // Fetch ALL therapists by requesting a large limit without offset
      const response = await api.therapists.getAllTherapists({ 
        limit: 1000, // High limit to get all therapists
        offset: 0 
      });
      
      // Handle the actual API response structure (may have .data wrapper or be direct)
      const responseData = response.data || response;
      return responseData || { therapists: [], totalCount: 0 };
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
    try {
      const therapists = data?.therapists || [];
      
      if (therapists.length === 0) {
        return [];
      }
      
      // Use the unified transform function that handles both API formats
      return therapists.map(transformTherapistForCard);
    } catch (error) {
      console.error('Error transforming all therapists data:', error);
      return [];
    }
  }, [data?.therapists]);

  return {
    therapists: therapistCards,
    totalCount: data?.totalCount || 0,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for client-side filtering of all therapists
 * This version loads ALL therapists and then filters them on the client side
 */
export function useAllTherapistsWithClientFilters(
  searchQuery: string = "",
  selectedFilter: string = "All"
) {
  // Get ALL therapists first
  const { therapists: allTherapists, isLoading, error, refetch } = useAllTherapists();

  // Client-side filtering
  const filteredTherapists = React.useMemo(() => {
    return allTherapists.filter((therapist) => {
      // Ensure therapist has valid data
      if (!therapist?.id || !therapist?.name) {
        console.warn('Filtering out therapist with invalid data:', therapist);
        return false;
      }

      // Basic search filter
      const matchesSearch =
        searchQuery === "" ||
        therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        therapist.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (therapist.specialties && therapist.specialties.length > 0 && 
         therapist.specialties.some((specialty) =>
           specialty?.toLowerCase().includes(searchQuery.toLowerCase())
         ));

      // Basic category filter - if no specialties, only match "All"
      const matchesFilter =
        selectedFilter === "All" ||
        (therapist.specialties && therapist.specialties.length > 0 && 
         therapist.specialties.some((specialty) => specialty === selectedFilter));

      const result = matchesSearch && matchesFilter;
      
      // Debug logging for filtering issues
      if (!result && process.env.NODE_ENV === 'development') {
        console.debug('Therapist filtered out:', {
          name: therapist.name,
          specialties: therapist.specialties,
          searchQuery,
          selectedFilter,
          matchesSearch,
          matchesFilter
        });
      }

      return result;
    });
  }, [allTherapists, searchQuery, selectedFilter]);

  return {
    therapists: filteredTherapists,
    allTherapists, // Also return all therapists for reference
    totalCount: filteredTherapists.length,
    totalTherapists: allTherapists.length,
    isLoading,
    error,
    refetch,
  };
}

export default useAllTherapists;