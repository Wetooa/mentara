/**
 * Auth DTOs - Pure TypeScript interfaces without validation
 * Validation should be handled separately from type definitions
 */

// Authentication DTOs
export interface LoginDto {
  email: string;
  password: string;
  sessionId?: string;
}

export interface RegisterUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface LogoutDto {
  refreshToken?: string;
}

// Password management DTOs
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RequestPasswordResetDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Email verification DTOs
export interface SendVerificationEmailDto {
  email?: string;
}

export interface ResendVerificationEmailDto {
  email: string;
}

export interface VerifyEmailDto {
  token: string;
}

// OTP DTOs
export interface SendOtpDto {
  email: string;
  type: 'registration' | 'password_reset' | 'login_verification';
}

export interface VerifyOtpDto {
  email: string;
  otpCode: string;
  type: 'registration' | 'password_reset' | 'login_verification';
}

export interface ResendOtpDto {
  email: string;
  type: 'registration' | 'password_reset' | 'login_verification';
}

// Registration OTP DTOs
export interface VerifyRegistrationOtpDto {
  email: string;
  otpCode: string;
}

export interface ResendRegistrationOtpDto {
  email: string;
}

export interface RegisterWithOtpDto {
  email: string;
  otpCode: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

// Role-specific registration DTOs
export interface RegisterClientDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate?: string; // ISO date string
  address?: string;
  avatarUrl?: string;
  hasSeenTherapistRecommendations?: boolean;
  preassessmentAnswers?: any; // Pre-assessment responses
  sessionId?: string; // For linking anonymous assessments
}

export interface RegisterAdminDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  permissions: string[];
}

export interface RegisterModeratorDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  permissions: string[];
  assignedCommunities: string[];
}

export interface RegisterTherapistDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  
  // Therapist profile info
  mobile: string;
  province: string;
  timezone?: string;
  providerType: string;
  professionalLicenseType: string;
  professionalLicenseType_specify?: string;
  isPRCLicensed: string; 
  prcLicenseNumber: string;
  expirationDateOfLicense: string; // ISO date string
  practiceStartDate: string; // ISO date string
  
  certifications?: any;
  certificateUrls?: string[];
  certificateNames?: string[];
  licenseUrls?: string[];
  licenseNames?: string[];
  documentUrls?: string[];
  documentNames?: string[];
  
  yearsOfExperience?: number;
  educationBackground?: string;
  specialCertifications?: string[];
  practiceLocation?: string;
  
  acceptsInsurance?: boolean;
  acceptedInsuranceTypes?: string[];
  
  areasOfExpertise?: string[];
  assessmentTools?: string[];
  therapeuticApproachesUsedList?: string[];
  therapeuticApproachesUsedList_specify?: string[];
  
  languagesOffered?: string[];
  languagesOffered_specify?: string;
  
  providedOnlineTherapyBefore: string; 
  comfortableUsingVideoConferencing: string;
  
  preferredSessionLength: number[];
  preferredSessionLength_specify?: string;
  
  privateConfidentialSpace?: string;
  compliesWithDataPrivacyAct: string;
  professionalLiabilityInsurance?: string;
  complaintsOrDisciplinaryActions?: string;
  willingToAbideByPlatformGuidelines: string;
  
  expertise?: string[];
  approaches?: string[];
  languages?: string[];
  illnessSpecializations?: string[];
  acceptTypes?: string[];
  treatmentSuccessRates?: any;
  sessionLength: string;
  hourlyRate: number;
}

// Session management DTOs
export interface TerminateSessionDto {
  sessionId: string;
}

export interface CheckUserExistsDto {
  email: string;
}