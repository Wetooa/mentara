import { useMemo, useCallback } from "react";
import { STALE_TIME, GC_TIME } from "@/lib/constants/react-query";
import { transformTherapistForCard } from "@/types/therapist";
import { 
  useRecommendationsControllerGetTherapistRecommendations,
  useRecommendationsControllerGetCommunityRecommendations 
} from "api-client";
import type { 
  TherapistRecommendationResponseDto,
  CommunityRecommendationResponseDto,
  RecommendedTherapistDto,
  RecommendedCommunityDto
} from "api-client";

export interface UseTherapistRecommendationsOptions {
  /** Maximum number of therapists to fetch */
  limit?: number;
  /** Whether to include inactive therapists */
  includeInactive?: boolean;
  /** Specific province filter */
  province?: string;
  /** Maximum hourly rate filter */
  maxHourlyRate?: number;
}

export interface UseTherapistRecommendationsReturn {
  /** Array of recommended therapists */
  therapists: RecommendedTherapistDto[];
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
  /** Average match score */
  averageMatchScore?: number;
}

export interface UseWelcomeRecommendationsOptions {
  /** Maximum number of therapists to fetch */
  limit?: number;
  /** Whether to include inactive therapists */
  includeInactive?: boolean;
  /** Force refresh the recommendations */
  forceRefresh?: boolean;
  /** Specific province filter */
  province?: string;
}

export interface UseWelcomeRecommendationsReturn {
  /** Array of recommended therapists */
  therapists: RecommendedTherapistDto[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Refetch function */
  refetch: () => void;
  /** Total count of recommendations */
  totalCount: number;
  /** Average match score */
  averageMatchScore?: number;
  /** Welcome message for the user */
  welcomeMessage?: string;
  /** Communities data for welcome page */
  communities: RecommendedCommunityDto[];
  /** Whether this is the first time the user is seeing recommendations */
  isFirstTime?: boolean;
}

/**
 * Hook for fetching personalized therapist recommendations
 * Best for: Recommendation sections, "Suggested for You" areas
 */
export function useTherapistRecommendations(
  _options: UseTherapistRecommendationsOptions = {}
): UseTherapistRecommendationsReturn {
  const { 
    data: recommendationsResponse, 
    isLoading, 
    error,
    refetch 
  } = useRecommendationsControllerGetTherapistRecommendations({
    query: {
      staleTime: STALE_TIME.MEDIUM, // 5 minutes
      gcTime: GC_TIME.MEDIUM, // 10 minutes
      enabled: true,
      refetchOnWindowFocus: false,
    }
  });

  // Transform and memoize the data - handle actual API response structure
  const transformedData = useMemo(() => {
    if (!recommendationsResponse) {
      return {
        therapists: [],
        totalCount: 0,
        userConditions: [],
        averageMatchScore: 0,
      };
    }

    const dataPayload = (recommendationsResponse as TherapistRecommendationResponseDto).data;
    const therapists = dataPayload?.therapists || [];
    const totalCount = dataPayload?.total || 0;
    const userConditions = dataPayload?.userConditions || [];
    
    // Calculate average match score from actual API structure
    const averageMatchScore = therapists.length > 0
      ? therapists.reduce((sum: number, therapist: RecommendedTherapistDto) => sum + (therapist.matchScore || 0), 0) / therapists.length
      : 0;

    return {
      therapists,
      totalCount,
      userConditions,
      averageMatchScore,
    };
  }, [recommendationsResponse]);

  return {
    ...transformedData,
    isLoading: !!isLoading,
    error: error as Error | null,
    refetch: refetch as () => void,
  };
}

/**
 * Hook specifically for welcome page recommendations
 * Includes communities and additional welcome-specific data
 */
export function useWelcomeRecommendations(
): UseWelcomeRecommendationsReturn {
  const {
    data: therapistsResponse,
    isLoading: isLoadingTherapists,
    error: therapistsError,
    refetch: refetchTherapists,
  } = useRecommendationsControllerGetTherapistRecommendations({
    query: {
      staleTime: STALE_TIME.MEDIUM, // 5 minutes
      gcTime: GC_TIME.MEDIUM, // 10 minutes
      refetchOnWindowFocus: false,
    }
  });

  const {
    data: communitiesResponse,
    isLoading: isLoadingCommunities,
    error: communitiesError,
    refetch: refetchCommunities,
  } = useRecommendationsControllerGetCommunityRecommendations({
    query: {
      staleTime: STALE_TIME.MEDIUM, // 5 minutes
      gcTime: GC_TIME.MEDIUM, // 10 minutes
      refetchOnWindowFocus: false,
    }
  });



  const refetch = useCallback(() => {
    refetchTherapists();
    refetchCommunities();
  }, [refetchTherapists, refetchCommunities]);

  const memoizedTherapists = useMemo(() => {
    const dataPayload = (therapistsResponse as TherapistRecommendationResponseDto)?.data;
    return dataPayload?.therapists || [];
  }, [therapistsResponse]);

  const memoizedCommunities = useMemo(() => {
    const dataPayload = (communitiesResponse as CommunityRecommendationResponseDto)?.data;
    return dataPayload?.communities || [];
  }, [communitiesResponse]);

  // Calculate average match score
  const averageMatchScore = useMemo(() => {
    if (!memoizedTherapists.length) return 0;
    const totalScore = memoizedTherapists.reduce((sum, t) => sum + (t.matchScore || 0), 0);
    return Math.round(totalScore / memoizedTherapists.length);
  }, [memoizedTherapists]);

  return {
    therapists: memoizedTherapists,
    communities: memoizedCommunities,
    isLoading: isLoadingTherapists || isLoadingCommunities,
    error: therapistsError || communitiesError,
    refetch,
    welcomeMessage: "We've found some great matches for you based on your assessment.",
    isFirstTime: true,
    averageMatchScore,
    totalCount: memoizedTherapists.length + memoizedCommunities.length,
  };
}

/**
 * Hook specifically for recommendation carousel sections
 * Optimized for carousel display with proper card data transformation
 */
export function useCarouselRecommendations() {
  const { therapists, isLoading, error, refetch } = useTherapistRecommendations();

  // Pre-transform therapists for the card components used in the carousel
  const therapistCards = useMemo(() => {
    if (!therapists) return [];
    return therapists.map(transformTherapistForCard);
  }, [therapists]);

  return {
    therapists,
    therapistCards,
    isLoading,
    error,
    refetch,
  };
}