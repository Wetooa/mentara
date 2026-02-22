/**
 * Therapist Module DTOs - Data Transfer Objects for therapist operations
 * These are pure TypeScript interfaces without validation logic
 */

// Note: WorksheetCreateInputDto is now imported from worksheets module to avoid duplication

export interface WorksheetUpdateInputDto {
  title?: string;
  description?: string;
  content?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  type?: 'assignment' | 'exercise' | 'reflection' | 'assessment';
  estimatedDuration?: number; // in minutes
  tags?: string[];
  dueDate?: string; // ISO string
  isTemplate?: boolean;
  templateCategory?: string;
  isActive?: boolean;
}

// Therapist Recommendation DTOs
export interface TherapistRecommendationQuery {
  limit?: number;
  offset?: number;
  includeUnavailable?: boolean;
  includeInactive?: boolean;
  specialties?: string[];
  sessionFormats?: string[];
  minRating?: number;
  maxDistance?: number;
  languages?: string[];
  genderPreference?: 'male' | 'female' | 'any';
  ageRangePreference?: {
    min?: number;
    max?: number;
  };
  province?: string;
  maxHourlyRate?: number;
}

export interface WelcomeRecommendationQuery {
  limit?: number;
  includePreferences?: boolean;
  forceRefresh?: boolean;
  province?: string;
}

export interface TherapistRecommendationRequest {
  userId: string;
  limit?: number;
  province?: string;
  maxHourlyRate?: number;
  includeInactive?: boolean; // Include inactive therapists in recommendations
  query?: TherapistRecommendationQuery;
}

export interface TherapistRecommendationResponse {
  therapists: Array<{
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string;
    };
    specialties: string[];
    sessionFormats: string[];
    languages: string[];
    rating: number;
    reviewCount: number;
    yearsOfExperience: number;
    hourlyRate: number;
    bio: string;
    isAvailable: boolean;
    matchScore: number;
    matchReasons: string[];
    nextAvailableSlot?: string;
  }>;
  total: number;
  hasMore: boolean;
  recommendations: {
    featured: string[]; // therapist IDs
    bestMatch: string[]; // therapist IDs  
    newTherapists: string[]; // therapist IDs
  };
}

export interface TherapistRecommendationResponseDto {
  success: boolean;
  data: TherapistRecommendationResponse;
  message?: string;
}

// Therapist List DTOs - for basic therapist listing (non-AI)
export interface TherapistListQuery {
  limit?: number;
  offset?: number;
  search?: string;
  specialties?: string[];
  languages?: string[];
  province?: string;
  minHourlyRate?: number;
  maxHourlyRate?: number;
  minRating?: number;
  minExperience?: number;
  maxExperience?: number;
  sortBy?: 'rating' | 'experience' | 'hourlyRate' | 'name';
  sortOrder?: 'asc' | 'desc';
  includeInactive?: boolean;
}

export interface TherapistListItem {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    bio?: string;
  };
  specialties: string[];
  languages: string[];
  areasOfExpertise: string[];
  approaches: string[];
  province: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  yearsOfExperience: number;
  isActive: boolean;
  licenseVerified: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface TherapistListResponse {
  therapists: TherapistListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}