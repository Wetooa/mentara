import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { TherapistRecommendation } from "@/lib/api/services/therapists";
import { TherapistCardData, transformTherapistForCard, transformApiTherapistForCard, ApiTherapistResponse } from "@/types/therapist";

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
  options: UseTherapistRecommendationsOptions = {}
): UseTherapistRecommendationsReturn {
  const {
    limit = 10,
    includeInactive = false,
    province,
    maxHourlyRate,
  } = options;

  const api = useApi();

  const { 
    data: recommendationsData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['therapists', 'recommendations', { limit, includeInactive, province, maxHourlyRate }],
    queryFn: () => api.therapists.getRecommendations({ 
      limit, 
      includeInactive, 
      province,
      maxHourlyRate 
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });

  // Transform and memoize the data - handle actual API response structure
  const transformedData = useMemo(() => {
    if (!recommendationsData) {
      return {
        therapists: [],
        totalCount: 0,
        userConditions: [],
        matchCriteria: undefined,
        averageMatchScore: 0,
      };
    }

    // Handle the actual API response structure: { success, data: { therapists, totalCount, ... }, timestamp }
    const dataPayload = recommendationsData.data || recommendationsData;
    const therapists = dataPayload.therapists || [];
    const totalCount = dataPayload.totalCount || 0;
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
  options: UseWelcomeRecommendationsOptions = {}
): UseWelcomeRecommendationsReturn {
  const {
    limit = 10,
    includeInactive = false,
    forceRefresh = false,
    province,
  } = options;

  const api = useApi();

  const { 
    data: recommendationsData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: queryKeys.therapists.recommendations({ 
      limit, 
      includeInactive, 
      province, 
      forceRefresh,
      welcome: true 
    }),
    queryFn: () => api.therapists.getWelcomeRecommendations({ 
      limit, 
      includeInactive, 
      province, 
      forceRefresh 
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
        averageMatchScore: 0,
        welcomeMessage: undefined,
        isFirstTime: false,
        communities: [],
      };
    }

    // Handle welcome page response format
    const therapists = recommendationsData.recommendations || [];
    const totalCount = recommendationsData.totalCount || 0;
    
    // Calculate average match score
    const averageMatchScore = therapists.length > 0
      ? therapists.reduce((sum: number, therapist: any) => sum + (therapist.matchScore || therapist.score || 0), 0) / therapists.length
      : 0;

    return {
      therapists,
      totalCount,
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
      
      // Check if we have the actual API structure (with user nested object)
      if (therapists.length > 0 && therapists[0].user) {
        // Use the new transform function for actual API data
        return therapists.map((therapist: ApiTherapistResponse) => transformApiTherapistForCard(therapist));
      } else {
        // Fallback to the old transform function for backward compatibility
        return therapists.map(transformTherapistForCard);
      }
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