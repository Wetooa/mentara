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
  // Validate required fields
  if (!therapist?.userId) {
    console.error('Therapist missing userId:', therapist);
    throw new Error('Therapist data is missing required userId field');
  }

  if (!therapist?.firstName && !therapist?.lastName && !therapist?.name) {
    console.error('Therapist missing name data:', therapist);
  }

  // Debug logging for data validation in development
  if (process.env.NODE_ENV === 'development') {
    if (!therapist.specialties || therapist.specialties.length === 0) {
      console.debug('Therapist has no specialties:', {
        id: therapist.userId,
        name: therapist.name || `${therapist.firstName} ${therapist.lastName}`,
        areasOfExpertise: therapist.areasOfExpertise
      });
    }
  }

  const transformed = {
    id: therapist.userId, // Backend always returns userId as primary identifier
    name: therapist.name || `${therapist.firstName || ''} ${therapist.lastName || ''}`.trim() || 'Unknown Therapist',
    title: therapist.title || 'Licensed Therapist',
    specialties: Array.isArray(therapist.specialties) ? therapist.specialties : 
                Array.isArray(therapist.areasOfExpertise) ? therapist.areasOfExpertise : [],
    experience: Math.max(0, therapist.experience || therapist.yearsOfExperience || 0),
    availableTimes: [], // This would need to come from a separate availability API
    isActive: therapist.isActive ?? true, // Use nullish coalescing for boolean
    bio: therapist.bio || '',
    imageUrl: therapist.profileImage || therapist.avatarUrl || '/team/default-therapist.jpg',
    rating: Math.max(0, Math.min(5, therapist.rating || 0)), // Clamp rating between 0-5
    sessionPrice: therapist.sessionPrice || `$${therapist.hourlyRate || 120}`,
    sessionDuration: 45, // Default session duration
    location: therapist.location || therapist.province || '',
    languages: Array.isArray(therapist.languages) ? therapist.languages : [],
    totalReviews: Math.max(0, therapist.totalReviews || 0),
  };

  // Final validation of transformed data
  if (!transformed.id || !transformed.name.trim()) {
    console.error('Transform produced invalid therapist data:', { original: therapist, transformed });
  }

  return transformed;
}