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
  sessionLength?: string;
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
}

// Helper function to transform API response to frontend format
export function transformTherapistForCard(therapist: TherapistRecommendation): TherapistCardData {
  const currentYear = new Date().getFullYear();
  const practiceStartYear = new Date(therapist.practiceStartDate).getFullYear();
  const experience = currentYear - practiceStartYear;

  return {
    id: therapist.userId,
    name: `${therapist.firstName} ${therapist.lastName}`,
    title: therapist.professionalLicenseType || 'Licensed Therapist',
    specialties: therapist.expertise || therapist.areasOfExpertise || [],
    experience,
    availableTimes: [], // This would need to come from a separate availability API
    isActive: therapist.isActive,
    bio: therapist.bio || '',
    imageUrl: therapist.profileImageUrl || therapist.user.profileImageUrl || '/team/default-therapist.jpg',
    rating: therapist.patientSatisfaction ? Number(therapist.patientSatisfaction) : 4.0,
    sessionPrice: therapist.hourlyRate ? Number(therapist.hourlyRate) : 120,
    sessionDuration: therapist.sessionLength ? parseInt(therapist.sessionLength) : 45,
  };
}