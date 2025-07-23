import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { TherapistRecommendation } from "@/lib/api/services/therapists";

export interface UseRecommendedTherapistsOptions {
  /** Maximum number of therapists to fetch */
  limit?: number;
  /** Whether to include inactive therapists */
  includeInactive?: boolean;
  /** Force refresh the recommendations */
  forceRefresh?: boolean;
  /** Specific province filter */
  province?: string;
  /** Whether this is for the welcome page flow */
  isWelcomePage?: boolean;
}

export interface UseRecommendedTherapistsReturn {
  /** Array of recommended therapists */
  therapists: TherapistRecommendation[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Refetch function */
  refetch: () => void;
  /** Total count of recommendations */
  totalCount: number;
  /** User conditions from assessment */
  userConditions?: string[];
  /** Match criteria used for recommendations */
  matchCriteria?: any;
  /** Average match score */
  averageMatchScore?: number;
  /** Welcome message (for welcome page) */
  welcomeMessage?: string;
  /** Whether this is first time seeing recommendations */
  isFirstTime?: boolean;
  /** Communities data (for welcome page) */
  communities?: any[];
}

/**
 * Unified hook for fetching personalized therapist recommendations
 * Replaces duplicate logic in RecommendedSection and client welcome page
 */
export function useRecommendedTherapists(
  options: UseRecommendedTherapistsOptions = {}
): UseRecommendedTherapistsReturn {
  const {
    limit = 10,
    includeInactive = false,
    forceRefresh = false,
    province,
    isWelcomePage = false,
  } = options;

  const api = useApi();

  // Choose the appropriate query key and endpoint
  const queryKey = isWelcomePage
    ? queryKeys.therapists.recommendations({ 
        limit, 
        includeInactive, 
        province, 
        forceRefresh,
        welcome: true 
      })
    : ['therapists', 'recommendations', 'personalized', { limit, includeInactive, province }];

  const { 
    data: recommendationsData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey,
    queryFn: () => isWelcomePage 
      ? api.therapists.getPersonalizedRecommendations({ 
          limit, 
          includeInactive, 
          province, 
          forceRefresh 
        })
      : api.therapists.getPersonalizedRecommendations({ 
          limit, 
          includeInactive, 
          province 
        }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });

  // Transform and memoize the data
  const transformedData = useMemo(() => {
    if (!recommendationsData) {
      return {
        therapists: [],
        totalCount: 0,
        userConditions: [],
        matchCriteria: undefined,
        averageMatchScore: 0,
        welcomeMessage: undefined,
        isFirstTime: false,
        communities: [],
      };
    }

    // Handle both recommendation and welcome page response formats
    const therapists = recommendationsData.recommendations || recommendationsData.data?.therapists || [];
    const totalCount = recommendationsData.totalCount || recommendationsData.data?.totalCount || 0;
    const userConditions = recommendationsData.userConditions || recommendationsData.data?.userConditions || [];
    const matchCriteria = recommendationsData.matchCriteria || recommendationsData.data?.matchCriteria;
    
    // Calculate average match score
    const averageMatchScore = therapists.length > 0
      ? therapists.reduce((sum: number, therapist: any) => sum + (therapist.matchScore || therapist.score || 0), 0) / therapists.length
      : 0;

    return {
      therapists,
      totalCount,
      userConditions,
      matchCriteria,
      averageMatchScore,
      welcomeMessage: recommendationsData.welcomeMessage,
      isFirstTime: recommendationsData.isFirstTime || false,
      communities: recommendationsData.communities || [],
    };
  }, [recommendationsData]);

  return {
    ...transformedData,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook specifically for welcome page recommendations
 * Includes communities and additional welcome-specific data
 */
export function useWelcomeRecommendations(
  options: Omit<UseRecommendedTherapistsOptions, 'isWelcomePage'> = {}
) {
  return useRecommendedTherapists({
    ...options,
    isWelcomePage: true,
  });
}

/**
 * Hook specifically for recommendation section
 * Optimized for carousel display
 */
export function useCarouselRecommendations(
  options: Omit<UseRecommendedTherapistsOptions, 'isWelcomePage'> = {}
) {
  return useRecommendedTherapists({
    limit: 6, // Good number for carousel display
    ...options,
    isWelcomePage: false,
  });
}