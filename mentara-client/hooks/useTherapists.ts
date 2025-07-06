import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api/api-client';
import { queryKeys } from '@/lib/queryKeys';
import { 
  TherapistRecommendationResponse, 
  TherapistSearchParams,
  TherapistCardData,
  transformTherapistForCard 
} from '@/types/therapist';
import { TherapistFilters } from '@/types/filters';

// Hook for fetching therapist recommendations
export function useTherapistRecommendations(params: TherapistSearchParams = {}) {
  const api = useApi();

  return useQuery({
    queryKey: queryKeys.therapists.recommendations(params),
    queryFn: (): Promise<TherapistRecommendationResponse> => {
      return api.therapists.getRecommendations(params);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook that transforms the API data to match the current frontend format
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

// Hook for filtering therapists based on search and filter criteria with pagination
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
  
  const { therapists, isLoading, error, refetch, totalCount, userConditions, matchCriteria } = useTherapistCards({
    ...searchParams,
    limit: pageSize * 3, // Fetch more data to handle client-side filtering
  });

  // Client-side filtering
  const filteredTherapists = therapists.filter((therapist) => {
    // Basic search and filter
    const matchesSearch =
      searchQuery === "" ||
      therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.specialties.some((specialty) =>
        specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesFilter =
      filter === "All" ||
      therapist.specialties.some((specialty) => specialty === filter);

    // Advanced filters
    if (advancedFilters) {
      // Specialties filter
      if (advancedFilters.specialties.length > 0) {
        const hasMatchingSpecialty = advancedFilters.specialties.some(filterSpecialty =>
          therapist.specialties.some(therapistSpecialty =>
            therapistSpecialty.toLowerCase().includes(filterSpecialty.toLowerCase())
          )
        );
        if (!hasMatchingSpecialty) return false;
      }

      // Price range filter
      const therapistPrice = parseFloat(therapist.sessionPrice.replace('$', ''));
      if (therapistPrice < advancedFilters.priceRange.min || 
          therapistPrice > advancedFilters.priceRange.max) {
        return false;
      }

      // Location filter
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
      if (therapist.experience < advancedFilters.experienceLevel.min || 
          therapist.experience > advancedFilters.experienceLevel.max) {
        return false;
      }

      // Language filter (if therapist has language data)
      if (advancedFilters.languages.length > 0 && therapist.languages) {
        const hasMatchingLanguage = advancedFilters.languages.some(filterLang =>
          therapist.languages?.some((therapistLang: string) =>
            therapistLang.toLowerCase().includes(filterLang.toLowerCase())
          )
        );
        if (!hasMatchingLanguage) return false;
      }

      // Availability filter (basic implementation - could be enhanced)
      if (Object.values(advancedFilters.availability).some(Boolean)) {
        // For now, just check if therapist is active
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