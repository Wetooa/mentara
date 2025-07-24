// Frontend TypeScript interfaces for therapist data

// Updated interface to match actual API response structure
export interface TherapistUser {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  coverImageUrl?: string | null;
  bio: string | null;
  birthDate?: string;
  address?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string | null;
}

// New interface for the actual API therapist response structure
export interface ApiTherapistResponse {
  userId: string;
  mobile?: string;
  province?: string;
  timezone?: string;
  status: string;
  submissionDate?: string;
  processingDate?: string;
  processedByAdminId?: string | null;
  providerType?: string;
  professionalLicenseType?: string;
  isPRCLicensed?: string;
  prcLicenseNumber?: string;
  expirationDateOfLicense?: string;
  practiceStartDate?: string;
  licenseVerified: boolean;
  licenseVerifiedAt?: string | null;
  licenseVerifiedBy?: string | null;
  certifications?: any;
  certificateUrls: string[];
  certificateNames: string[];
  licenseUrls: string[];
  licenseNames: string[];
  documentUrls: string[];
  documentNames: string[];
  yearsOfExperience?: number | null;
  educationBackground?: string | null;
  specialCertifications: string[];
  practiceLocation?: string | null;
  acceptsInsurance: boolean;
  acceptedInsuranceTypes: string[];
  areasOfExpertise: string[];
  assessmentTools: string[];
  therapeuticApproachesUsedList: string[];
  languagesOffered: string[];
  providedOnlineTherapyBefore: boolean;
  comfortableUsingVideoConferencing: boolean;
  preferredSessionLength: number[];
  privateConfidentialSpace?: string;
  compliesWithDataPrivacyAct: boolean;
  professionalLiabilityInsurance?: string;
  complaintsOrDisciplinaryActions?: string;
  willingToAbideByPlatformGuidelines: boolean;
  expertise: string[];
  approaches: string[];
  languages: string[];
  illnessSpecializations: string[];
  acceptTypes: string[];
  treatmentSuccessRates: {
    trauma: number;
    anxiety: number;
    depression: number;
  };
  sessionLength: string;
  hourlyRate: string | number;
  createdAt: string;
  updatedAt: string;
  user: TherapistUser;
  reviews: any[];
  matchScore?: number;
  scoreBreakdown?: {
    conditionScore: number;
    approachScore: number;
    experienceScore: number;
    reviewScore: number;
    logisticsScore: number;
  };
  matchExplanation?: {
    primaryMatches: string[];
    secondaryMatches: string[];
    approachMatches: string[];
    experienceYears: number;
    averageRating: number;
    totalReviews: number;
    successRates: {
      trauma: number;
      anxiety: number;
      depression: number;
    };
  };
  clinicalMatch?: {
    urgencyAlignment: {
      score: number;
      reasoning: string;
    };
    specializationMatch: {
      score: number;
      matchedSpecializations: string[];
      reasoning: string;
    };
    experienceAdequacy: {
      score: number;
      reasoning: string;
    };
    approachCompatibility: {
      score: number;
      matchedApproaches: string[];
      reasoning: string;
    };
  };
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

// Updated response interface to match actual API structure
export interface ApiTherapistRecommendationResponse {
  success: boolean;
  data: {
    totalCount: number;
    userConditions: string[];
    therapists: ApiTherapistResponse[];
    matchCriteria: {
      primaryConditions: string[];
      secondaryConditions: string[];
      riskLevel: string;
      urgencyLevel: string;
      requiredSpecializations: string[];
      preferredApproaches: string[];
    };
    clinicalInsights: {
      overallRiskLevel: string;
      primaryConditionsCount: number;
      therapeuticPriorities: string[];
      recommendedSessionFrequency: string;
    };
    page: number;
    pageSize: string;
  };
  timestamp: string;
}

// Legacy interface for backward compatibility
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
  reviewCount?: number;
  languages?: string[];
  approaches?: string[];
  totalReviews?: number;
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
      sessionPrice: `$${therapist.hourlyRate || 120}`,
      sessionDuration: 45, // Default session duration
      location: therapist.province || '',
      reviewCount: therapist.reviewCount || 0,
      languages: therapist.languages || [],
      approaches: therapist.approaches || [],
      totalReviews: therapist.reviewCount || 0,
    };
  }

  // Fallback for old recommendation API format
  const currentYear = new Date().getFullYear();
  const practiceStartYear = therapist.practiceStartDate ? new Date(therapist.practiceStartDate).getFullYear() : currentYear;
  const experience = Math.max(0, currentYear - practiceStartYear);

  const transformed = {
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
    sessionPrice: `$${therapist.hourlyRate || 120}`,
    sessionDuration: therapist.sessionDuration || 45,
    location: therapist.province || '',
    reviewCount: 0,
    languages: therapist.languages || therapist.languagesOffered || [],
    approaches: therapist.approaches || therapist.therapeuticApproachesUsedList || [],
    totalReviews: therapist.reviewCount || 0,
  };

  // Final validation of transformed data
  if (!transformed.id || !transformed.name.trim()) {
    console.error('Transform produced invalid therapist data:', { original: therapist, transformed });
  }

  return transformed;
}

