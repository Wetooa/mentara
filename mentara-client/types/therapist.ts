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
<<<<<<< HEAD
  languages?: string[];
  totalReviews?: number;
}

// Helper function to transform actual API response to frontend format
export function transformApiTherapistForCard(therapist: ApiTherapistResponse): TherapistCardData {
  // Validate required fields
  if (!therapist?.userId) {
    console.error('Therapist missing userId:', therapist);
    throw new Error('Therapist data is missing required userId field');
  }

  if (!therapist?.user) {
    console.error('Therapist missing user data:', therapist);
    throw new Error('Therapist data is missing required user field');
  }

  const user = therapist.user;
  
  // Debug logging for data validation in development
  if (process.env.NODE_ENV === 'development') {
    if (!therapist.areasOfExpertise || therapist.areasOfExpertise.length === 0) {
      console.debug('Therapist has no areas of expertise:', {
        id: therapist.userId,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        expertise: therapist.expertise,
        illnessSpecializations: therapist.illnessSpecializations
      });
    }
  }

  // Calculate years of experience from practice start date if yearsOfExperience is null
  let experience = therapist.yearsOfExperience || 0;
  if (!experience && therapist.practiceStartDate) {
    const startDate = new Date(therapist.practiceStartDate);
    const now = new Date();
    experience = Math.max(0, now.getFullYear() - startDate.getFullYear());
  }

  // Combine all specialization fields into one array
  const allSpecialties = [
    ...(therapist.areasOfExpertise || []),
    ...(therapist.expertise || []),
    ...(therapist.illnessSpecializations || []),
  ].filter((item, index, arr) => arr.indexOf(item) === index); // Remove duplicates

  // Format session price
  let sessionPrice = '$120'; // Default
  if (typeof therapist.hourlyRate === 'string') {
    sessionPrice = therapist.hourlyRate.startsWith('$') ? therapist.hourlyRate : `$${therapist.hourlyRate}`;
  } else if (typeof therapist.hourlyRate === 'number') {
    sessionPrice = `$${therapist.hourlyRate}`;
  }

  // Get average rating from reviews or match explanation
  const rating = therapist.matchExplanation?.averageRating || 0;
  const totalReviews = therapist.matchExplanation?.totalReviews || therapist.reviews?.length || 0;

  const transformed: TherapistCardData = {
    id: therapist.userId,
    name: `${user.firstName || ''} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName || ''}`.trim() || 'Unknown Therapist',
    title: `${therapist.professionalLicenseType || 'Licensed'} Therapist`,
    specialties: allSpecialties.length > 0 ? allSpecialties : ['General Therapy'],
    experience: Math.max(0, experience),
    availableTimes: [], // This would need to come from a separate availability API
    isActive: user.isActive ?? true,
    bio: user.bio || 'Experienced therapist dedicated to helping you achieve your mental health goals.',
    imageUrl: user.avatarUrl || user.coverImageUrl || '/team/default-therapist.jpg',
    rating: Math.max(0, Math.min(5, rating)),
    sessionPrice,
    sessionDuration: therapist.preferredSessionLength?.[0] || 45,
    location: therapist.province || user.address || '',
    languages: therapist.languages?.length > 0 ? therapist.languages : therapist.languagesOffered || ['English'],
    totalReviews: Math.max(0, totalReviews),
=======
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
>>>>>>> ae0c63ed89776ab3d3e135ed136ca0e10bca53e0
  };

  // Final validation of transformed data
  if (!transformed.id || !transformed.name.trim()) {
    console.error('Transform produced invalid therapist data:', { original: therapist, transformed });
  }

  return transformed;
}

// Keep the old function for backward compatibility but mark as deprecated
/** @deprecated Use transformApiTherapistForCard instead */
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