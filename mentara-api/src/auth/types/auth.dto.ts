/**
 * Auth DTOs - Pure TypeScript interfaces without validation
 * Validation should be handled separately from type definitions
 */

// Authentication DTOs
export interface LoginDto {
  email: string;
  password: string;
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
  bio: string;
  specializations: string[];
  credentials: string[];
  experience: number;
  languages: string[];
  hourlyRate?: number;
  mobile: string;
  province: string;
  providerType: string;
  professionalLicenseType_specify?: string;
  professionalLicenseType: string;
  isPRCLicensed: string; // Changed to string to match usage
  prcLicenseNumber?: string;
  expirationDateOfLicense: string; // ISO date string
  practiceStartDate: string; // ISO date string
  preferredSessionLength_specify?: string;
  preferredSessionLength: string;
  providedOnlineTherapyBefore: string; // Changed to string to match usage
  comfortableUsingVideoConferencing: string; // Changed to string to match usage
  compliesWithDataPrivacyAct: string; // Changed to string to match usage
  willingToAbideByPlatformGuidelines: string; // Changed to string to match usage
  areasOfExpertise: string[];
  assessmentTools: string[];
  therapeuticApproachesUsedList: string[];
  therapeuticApproachesUsedList_specify?: string[];
  languagesOffered: string[];
  languagesOffered_specify?: string;
  privateConfidentialSpace: string;
  professionalLiabilityInsurance: string;
  complaintsOrDisciplinaryActions: string;
  accepts?: string[];
}

// Session management DTOs
export interface TerminateSessionDto {
  sessionId: string;
}

export interface CheckUserExistsDto {
  email: string;
}