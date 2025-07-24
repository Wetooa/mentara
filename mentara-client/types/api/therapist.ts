// Therapist recommendation and management types

export interface TherapistRecommendationQuery {
  specializations?: string[];
  gender?: "male" | "female" | "non-binary" | "other";
  ageRange?: "young-adult" | "adult" | "senior";
  languages?: string[];
  sessionType?: "in-person" | "video" | "phone";
  location?: string;
  maxDistance?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  availability?: {
    days: string[];
    timeOfDay: "morning" | "afternoon" | "evening";
  };
  experience?: {
    minYears?: number;
    specialConditions?: string[];
  };
}

export interface WelcomeRecommendationQuery {
  preAssessmentId?: string;
  specializations?: string[];
  location?: string;
  sessionType?: "in-person" | "video" | "phone";
  gender?: "male" | "female" | "non-binary" | "other";
}

export interface TherapistSearchParams {
  query?: string;
  specializations?: string[];
  location?: string;
  radius?: number;
  sortBy?: "rating" | "experience" | "price" | "distance";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  filters?: TherapistRecommendationQuery;
}

export interface TherapistRecommendation {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  specialties: string[];
  hourlyRate: number;
  experience: number;
  province: string | null;
  isActive: boolean;
  bio?: string;
  profileImage?: string | undefined;
}

export interface TherapistRecommendationResponse {
  recommendations: TherapistRecommendation[];
  total: number;
  hasMore: boolean;
  matchCriteria?: {
    primaryFactors: string[];
    secondaryFactors: string[];
    preAssessmentMatch?: boolean;
  };
  metadata?: {
    searchQuery: TherapistRecommendationQuery;
    resultsCount: number;
    avgMatchScore: number;
  };
}
