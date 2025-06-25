import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { 
  TherapistRecommendationResponse, 
  TherapistSearchParams,
  TherapistCardData,
  transformTherapistForCard 
} from '@/types/therapist';

// Hook for fetching therapist recommendations
export function useTherapistRecommendations(params: TherapistSearchParams = {}) {
  const api = useApi();

  return useQuery({
    queryKey: ['therapist-recommendations', params],
    queryFn: async (): Promise<TherapistRecommendationResponse> => {
      return api.therapistRecommendations.getRecommendations(params);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
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
  params: TherapistSearchParams & { page?: number; pageSize?: number } = {}
) {
  const { page = 1, pageSize = 20, ...searchParams } = params;
  
  const { therapists, isLoading, error, refetch, totalCount, userConditions, matchCriteria } = useTherapistCards({
    ...searchParams,
    limit: pageSize * 3, // Fetch more data to handle client-side filtering
  });

  // Client-side filtering
  const filteredTherapists = therapists.filter((therapist) => {
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