// Frontend TypeScript interfaces for therapist data

export interface TherapistUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  profileImageUrl: string | null;
}

export interface TherapistRecommendation {
  userId: string;
  user: TherapistUser;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  province: string;
  providerType: string;
  professionalLicenseType: string;
  practiceStartDate: string;
  areasOfExpertise: string[];
  therapeuticApproachesUsedList: string[];
  languagesOffered: string[];
  expertise?: string[];
  approaches?: string[];
  languages?: string[];
  sessionDuration?: number;
  hourlyRate?: number;
  bio?: string;
  profileImageUrl?: string;
  isActive: boolean;
  patientSatisfaction?: number;
  totalPatients: number;
  matchScore?: number;
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
  sessionPrice: number;
  sessionDuration: number;
  location?: string;
  reviewCount?: number;
  languages?: string[];
  approaches?: string[];
}

// Helper function to transform API response to frontend format
export function transformTherapistForCard(therapist: any): TherapistCardData {
  // Handle both old and new API response formats
  
  // For new therapist list API response
  if (therapist.user) {
    return {
      id: therapist.id || therapist.userId,
      name: `${therapist.user.firstName} ${therapist.user.lastName}`,
      title: 'Licensed Therapist',
      specialties: therapist.specialties || therapist.areasOfExpertise || [],
      experience: therapist.yearsOfExperience || 0,
      availableTimes: [], // This would need to come from a separate availability API
      isActive: therapist.isActive,
      bio: therapist.user.bio || '',
      imageUrl: therapist.user.avatarUrl || '/team/default-therapist.jpg',
      rating: therapist.rating || 0,
      sessionPrice: therapist.hourlyRate || 120,
      sessionDuration: 45, // Default session duration
      location: therapist.province || '',
      reviewCount: therapist.reviewCount || 0,
      languages: therapist.languages || [],
      approaches: therapist.approaches || [],
    };
  }

  // Fallback for old recommendation API format
  const currentYear = new Date().getFullYear();
  const practiceStartYear = therapist.practiceStartDate ? new Date(therapist.practiceStartDate).getFullYear() : currentYear;
  const experience = Math.max(0, currentYear - practiceStartYear);

  return {
    id: therapist.userId || therapist.id,
    name: `${therapist.firstName} ${therapist.lastName}`,
    title: therapist.professionalLicenseType || 'Licensed Therapist',
    specialties: therapist.expertise || therapist.areasOfExpertise || [],
    experience,
    availableTimes: [], // This would need to come from a separate availability API
    isActive: therapist.isActive || true,
    bio: therapist.bio || '',
    imageUrl: therapist.profileImageUrl || therapist.user?.profileImageUrl || '/team/default-therapist.jpg',
    rating: therapist.patientSatisfaction ? Number(therapist.patientSatisfaction) : 4.0,
    sessionPrice: therapist.hourlyRate ? Number(therapist.hourlyRate) : 120,
    sessionDuration: therapist.sessionDuration || 45,
    location: therapist.province || '',
    reviewCount: 0,
    languages: therapist.languages || therapist.languagesOffered || [],
    approaches: therapist.approaches || therapist.therapeuticApproachesUsedList || [],
  };
}