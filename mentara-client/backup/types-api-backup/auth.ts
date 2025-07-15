// Auth-related DTOs matching backend exactly - FLAT STRUCTURES

export interface RegisterClientRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate?: string;
  address?: string;
  avatarUrl?: string;
  hasSeenTherapistRecommendations?: boolean;
}

export interface RegisterTherapistRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobile: string;
  province: string;
  providerType: string;
  professionalLicenseType: string;
  isPRCLicensed: string;
  prcLicenseNumber: string;
  expirationDateOfLicense?: string;
  isLicenseActive: string;
  practiceStartDate: string;
  yearsOfExperience?: string;
  areasOfExpertise: any;
  assessmentTools: any;
  therapeuticApproachesUsedList: any;
  languagesOffered: any;
  providedOnlineTherapyBefore: string;
  comfortableUsingVideoConferencing: string;
  weeklyAvailability: string;
  preferredSessionLength: string;
  accepts: any;
  privateConfidentialSpace?: string;
  compliesWithDataPrivacyAct?: string;
  professionalLiabilityInsurance?: string;
  complaintsOrDisciplinaryActions?: string;
  willingToAbideByPlatformGuidelines?: string;
  sessionLength?: string;
  hourlyRate?: number;
  bio?: string;
  profileImageUrl?: string;
  applicationData?: any;
}

export interface UpdateClientDto {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  birthDate?: string;
  address?: string;
  avatarUrl?: string;
  bio?: string;
  coverImageUrl?: string;
}

export interface UpdateTherapistDto {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  birthDate?: string;
  address?: string;
  avatarUrl?: string;
  bio?: string;
  coverImageUrl?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  birthDate: string;
  address: string;
  avatarUrl: string;
  role: 'client' | 'therapist' | 'moderator' | 'admin';
  bio: string;
  coverImageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ForceLogoutRequest {
  userId: string;
  reason?: string;
}

export interface ForceLogoutResponse {
  success: boolean;
  message: string;
}

// Pre-assessment related types
export interface PreAssessmentSubmission {
  answerMatrix: number[][];
  metadata?: Record<string, any>;
}

export interface CommunityAssignmentResponse {
  success: boolean;
  assignedCommunities: string[];
}

export interface FirstSignInResponse {
  isFirstSignIn: boolean;
}

// Updated response types for JWT authentication
export interface AuthResponse {
  user: AuthUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

// For backward compatibility with existing code
export interface RegisterUserRequest extends RegisterClientRequest {}