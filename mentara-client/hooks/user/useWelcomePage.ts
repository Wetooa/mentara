"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/lib/api";
import { TherapistRecommendation, TherapistRecommendationResponse } from "@/lib/api/services/therapists";

/**
 * LocalStorage key for welcome page state
 */
const WELCOME_PAGE_VISITED_KEY = "welcome_page_visited";

/**
 * Therapist card properties for welcome page display
 */
export interface TherapistProps {
  /** Therapist profile photo URL */
  photo: string;
  /** Therapist first name */
  firstName: string;
  /** Therapist last name */
  lastName: string;
  /** Therapist specialty tags */
  tags: string[];
  /** Therapist description text */
  description: string;
}

/**
 * Match explanation data for therapist recommendations
 */
export interface MatchExplanation {
  /** Match percentage as string */
  matchPercentage: string;
  /** Specialties that match user conditions */
  matchingSpecialties: string[];
  /** Years of experience */
  experience?: number;
  /** Hourly rate */
  hourlyRate?: number;
}

/**
 * User assessment summary data
 */
export interface AssessmentSummary {
  /** Primary mental health conditions */
  primaryConditions: string[];
  /** Secondary mental health conditions */
  secondaryConditions: string[];
}

/**
 * Return type for the useWelcomePage hook
 */
export interface UseWelcomePageReturn {
  /** User's display name */
  userName: string;
  /** Recommended therapists list */
  therapists: TherapistRecommendation[];
  /** User's mental health conditions */
  userConditions: string[];
  /** Matching criteria used for recommendations */
  matchCriteria: any;
  /** Full recommendations response */
  recommendations: TherapistRecommendationResponse | undefined;
  /** Whether recommendations are loading */
  isLoading: boolean;
  /** Error if recommendations failed to load */
  error: Error | null;
  
  /** Map therapist API data to card display format */
  mapTherapistToCard: (therapist: TherapistRecommendation) => TherapistProps;
  /** Get match explanation for a therapist */
  getMatchExplanation: (therapist: TherapistRecommendation) => MatchExplanation;
  /** Get user's assessment summary */
  getAssessmentSummary: () => AssessmentSummary | null;
  
  /** Navigate to user dashboard */
  handleContinueToDashboard: () => void;
  /** Retry loading recommendations */
  handleRetry: () => void;
}

/**
 * Hook for managing the welcome page experience after onboarding completion
 * 
 * This hook handles the welcome page functionality including personalized therapist
 * recommendations, assessment summaries, and navigation to the main user dashboard.
 * It automatically marks the welcome page as visited and provides utilities for
 * displaying therapist matches and assessment data.
 * 
 * @returns Object containing welcome page data, utilities, and handlers
 * 
 * @example
 * ```tsx
 * function WelcomePage() {
 *   const {
 *     userName,
 *     therapists,
 *     isLoading,
 *     mapTherapistToCard,
 *     handleContinueToDashboard
 *   } = useWelcomePage();
 * 
 *   if (isLoading) {
 *     return <div>Loading recommendations...</div>;
 *   }
 * 
 *   return (
 *     <div>
 *       <h1>Welcome, {userName}!</h1>
 *       {therapists.map(therapist => (
 *         <TherapistCard key={therapist.id} {...mapTherapistToCard(therapist)} />
 *       ))}
 *       <button onClick={handleContinueToDashboard}>Continue to Dashboard</button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * Features:
 * - Personalized therapist recommendations based on assessment
 * - Match explanation with percentage and criteria
 * - Assessment summary display
 * - Automatic welcome page visit tracking
 * - Error handling with retry functionality
 * - Navigation to user dashboard
 */
export function useWelcomePage(): UseWelcomePageReturn {
  const { user } = useAuth();
  const api = useApi();
  const router = useRouter();

  /**
   * Mark that user has visited the welcome page
   */
  useEffect(() => {
    localStorage.setItem(WELCOME_PAGE_VISITED_KEY, 'true');
  }, []);

  // Fetch personalized therapist recommendations
  const { data: recommendations, isLoading, error } = useQuery<TherapistRecommendationResponse>({
    queryKey: ["therapist-recommendations"],
    queryFn: () => api.therapists.getRecommendations({ 
      limit: 8, // Show 8 recommendations in carousel
      includeInactive: false 
    }),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const userName = user?.firstName || "User";
  const therapists = recommendations?.therapists || [];
  const userConditions = recommendations?.userConditions || [];
  const matchCriteria = recommendations?.matchCriteria;

  // Map API therapist data to TherapistCard props
  const mapTherapistToCard = (therapist: TherapistRecommendation): TherapistProps => ({
    photo: therapist.profileImage || "laine.jpg", // fallback to default image
    firstName: therapist.firstName,
    lastName: therapist.lastName,
    tags: therapist.specialties || [],
    description: therapist.bio || `${therapist.experience} years of experience in ${therapist.specialties?.[0] || 'therapy'}.`,
  });

  // Component to show match explanation
  const getMatchExplanation = (therapist: TherapistRecommendation) => {
    const matchingSpecialties = therapist.specialties?.filter(specialty => 
      userConditions.includes(specialty)
    ) || [];
    
    const matchScore = therapist.matchScore || 0;
    const matchPercentage = Math.min(100, Math.max(0, (matchScore / 100) * 100));

    return {
      matchPercentage: matchPercentage.toFixed(0),
      matchingSpecialties,
      experience: therapist.experience,
      hourlyRate: therapist.hourlyRate,
    };
  };

  // Component to show user's assessment summary
  const getAssessmentSummary = () => {
    if (!matchCriteria) return null;
    
    const { primaryConditions, secondaryConditions } = matchCriteria;
    
    return {
      primaryConditions: primaryConditions || [],
      secondaryConditions: secondaryConditions || [],
    };
  };

  /**
   * Navigate to the user area after welcome page completion
   */
  const handleContinueToDashboard = (): void => {
    router.push('/user');
  };

  /**
   * Retry loading recommendations by refreshing the page
   */
  const handleRetry = (): void => {
    window.location.reload();
  };

  return {
    // Data
    userName,
    therapists,
    userConditions,
    matchCriteria,
    recommendations,
    isLoading,
    error,
    
    // Utilities
    mapTherapistToCard,
    getMatchExplanation,
    getAssessmentSummary,
    
    // Handlers
    handleContinueToDashboard,
    handleRetry,
  };
}