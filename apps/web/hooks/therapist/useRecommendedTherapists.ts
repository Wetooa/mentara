import { useMemo } from "react";
import { STALE_TIME, GC_TIME } from "@/lib/constants/react-query";
import type { TherapistRecommendation } from "@/types/api/therapist";
import { TherapistCardData, transformTherapistForCard } from "@/types/therapist";
import { useRecommendationsControllerGetRecommendations } from "api-client";

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
  therapists: TherapistRecommendation[];
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
  /** Whether this is first time seeing recommendations */
  isFirstTime?: boolean;
  /** Communities data for welcome page */
  communities?: any[];
}

/**
 * Hook for fetching personalized therapist recommendations
 * Best for: Recommendation sections, "Suggested for You" areas
 */
export function useTherapistRecommendations(
  options?: UseTherapistRecommendationsOptions
): UseTherapistRecommendationsReturn {

  const { 
    data: recommendationsResponse, 
    isLoading, 
    error,
    refetch 
  } = useRecommendationsControllerGetRecommendations({
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
        matchCriteria: undefined,
        averageMatchScore: 0,
      };
    }

    // Handle the actual API response structure: { success, data: { therapists, totalCount, ... }, timestamp }
    // @ts-expect-error - The generated orval client might return any/void, so we cast/access dynamically
    const dataPayload = recommendationsResponse?.data || recommendationsResponse;
    const therapists = dataPayload.therapists || [];
    const totalCount = dataPayload.total || dataPayload.totalCount || 0;
    const userConditions = dataPayload.userConditions || [];
    const matchCriteria = dataPayload.matchCriteria;
    
    // Calculate average match score from actual API structure
    const averageMatchScore = therapists.length > 0
      ? therapists.reduce((sum: number, therapist: any) => sum + (therapist.matchScore || 0), 0) / therapists.length
      : 0;

    return {
      therapists,
      totalCount,
      userConditions,
      matchCriteria,
      averageMatchScore,
    };
  }, [recommendationsResponse]);

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
  options?: UseWelcomeRecommendationsOptions
): UseWelcomeRecommendationsReturn {
  const { 
    data: recommendationsResponse, 
    isLoading, 
    error,
    refetch 
  } = useRecommendationsControllerGetRecommendations({
    query: {
      staleTime: STALE_TIME.MEDIUM, // 5 minutes
      gcTime: GC_TIME.MEDIUM, // 10 minutes
      refetchOnWindowFocus: false,
      enabled: true,
    }
  });

  // Transform and memoize the data
  const transformedData = useMemo(() => {
    if (!recommendationsResponse) {
      return {
        therapists: [],
        totalCount: 0,
        averageMatchScore: 0,
        welcomeMessage: undefined,
        isFirstTime: false,
        communities: [],
      };
    }

    // @ts-expect-error - The generated orval client might return any/void, so we cast/access dynamically
    const dataPayload = recommendationsResponse?.data || recommendationsResponse;

    // Handle welcome page response format
    const therapists = dataPayload.therapists || [];
    const totalCount = dataPayload.total || dataPayload.totalCount || 0;
    
    // Calculate average match score
    const averageMatchScore = therapists.length > 0
      ? therapists.reduce((sum: number, therapist: any) => sum + (therapist.matchScore || therapist.score || 0), 0) / therapists.length
      : 0;

    return {
      therapists,
      totalCount,
      averageMatchScore,
      welcomeMessage: dataPayload.message || dataPayload.welcomeMessage,
      isFirstTime: dataPayload.isFirstTime || false,
      communities: dataPayload.communities || [],
    };
  }, [recommendationsResponse]);

  return {
    ...transformedData,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook specifically for recommendation carousel sections
 * Optimized for carousel display with proper card data transformation
 */
export function useCarouselRecommendations(
  options: UseTherapistRecommendationsOptions = {}
): UseTherapistRecommendationsReturn & { 
  therapistCards: TherapistCardData[]
} {
  const recommendationsData = useTherapistRecommendations({
    limit: 6, // Good number for carousel display
    ...options,
  });

  // Transform therapists to card format for UI compatibility using the correct API structure
  const therapistCards = useMemo(() => {
    try {
      // Handle both the API response and the transformed therapists
      const therapists = recommendationsData.therapists || [];
      
      // Use the unified transform function that handles both API formats
      return therapists.map(transformTherapistForCard);
    } catch (error) {
      console.error('Error transforming therapist data for cards:', error);
      return [];
    }
  }, [recommendationsData.therapists]);

  return {
    ...recommendationsData,
    therapistCards,
  };
}