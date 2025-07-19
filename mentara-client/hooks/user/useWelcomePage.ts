"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/lib/api";
import { TherapistRecommendation, TherapistRecommendationResponse } from "@/lib/api/services/therapists";

export interface TherapistProps {
  photo: string;
  firstName: string;
  lastName: string;
  tags: string[];
  description: string;
}

export function useWelcomePage() {
  const { user } = useAuth();
  const api = useApi();
  const router = useRouter();

  // Mark that user has visited welcome page
  useEffect(() => {
    localStorage.setItem('welcome_page_visited', 'true');
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

  const handleContinueToDashboard = () => {
    router.push('/user/dashboard');
  };

  const handleRetry = () => {
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