// Frontend TypeScript interfaces for therapist data

export interface TherapistUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
}

export interface TherapistRecommendation {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  profileImage: string | null;
  bio: string | null;
  title: string;
  specialties: string[];
  areasOfExpertise: string[];
  approaches: string[];
  languages: string[];
  illnessSpecializations: string[];
  experience: number;
  yearsOfExperience: number;
  sessionPrice: string;
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  location: string;
  province: string;
  timezone: string;
  isActive: boolean;
  acceptsInsurance: boolean;
  acceptedInsuranceTypes: string[];
  sessionLength: string | null;
  preferredSessionLength: number[];
  createdAt: string;
  updatedAt: string;
  matchScore?: number;
  score?: number;
  rank?: number;
}

export interface TherapistRecommendationResponse {
  totalCount: number;
  userConditions: string[];
  therapists: TherapistRecommendation[];
  matchCriteria: {
    primaryConditions: string[];
    secondaryConditions: string[];
    severityLevels: Record<string, string>;
  };
  page?: number;
  pageSize?: number;
}

export interface TherapistSearchParams {
  limit?: number;
  includeInactive?: boolean;
  province?: string;
  maxHourlyRate?: number;
}

// Frontend-specific interfaces that match our current mock data structure
export interface TherapistCardData {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  experience: number;
  availableTimes: {
    day: string;
    time: string;
  }[];
  isActive: boolean;
  bio: string;
  imageUrl: string;
  rating: number;
  sessionPrice: string; // Changed to string to match backend "$120" format
  sessionDuration: number;
  location?: string;
  languages?: string[];
  totalReviews?: number;
}

// Helper function to transform API response to frontend format
export function transformTherapistForCard(therapist: TherapistRecommendation): TherapistCardData {
  return {
    id: therapist.id || therapist.userId,
    name: therapist.name || `${therapist.firstName} ${therapist.lastName}`,
    title: therapist.title || 'Licensed Therapist',
    specialties: therapist.specialties || therapist.areasOfExpertise || [],
    experience: therapist.experience || therapist.yearsOfExperience || 0,
    availableTimes: [], // This would need to come from a separate availability API
    isActive: therapist.isActive,
    bio: therapist.bio || '',
    imageUrl: therapist.profileImage || therapist.avatarUrl || '/team/default-therapist.jpg',
    rating: therapist.rating || 0,
    sessionPrice: therapist.sessionPrice || `$${therapist.hourlyRate || 120}`,
    sessionDuration: 45, // Default session duration
    location: therapist.location || therapist.province,
    languages: therapist.languages,
    totalReviews: therapist.totalReviews,
  };
}