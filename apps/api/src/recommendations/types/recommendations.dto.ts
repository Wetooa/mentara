export interface RecommendedTherapistDto {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  expertise: string[];
  illnessSpecializations: string[];
  therapeuticApproaches: string[];
  yearsOfExperience: number;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  matchScore: number;
  matchReasons: string[];
}

export interface RecommendationResponseDto {
  success: boolean;
  data: {
    therapists: RecommendedTherapistDto[];
    total: number;
    userConditions: string[];
    userContext?: {
      pastTherapyExperiences?: string | null;
      medicationHistory?: string | null;
      accessibilityNeeds?: string | null;
    };
  };
  message?: string;
}
