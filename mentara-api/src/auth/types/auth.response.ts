/**
 * Auth Response Types - API response structures for authentication
 */

import { UserRole } from '../../types/global';

// Token pair
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// Base auth user
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  client?: any; // Optional client data for client role users
}

// Auth response wrapper
export interface AuthResponse<T = AuthUser> {
  user: T;
  token: string; // Simplified single token approach
  tokens?: TokenPair; // Optional for backward compatibility
  isFirstLogin?: boolean;
  message?: string;
}

// Role-specific auth responses
export interface ClientAuthResponse extends AuthResponse {
  user: AuthUser & {
    role: UserRole.CLIENT;
    client?: {
      hasSeenTherapistRecommendations: boolean;
    };
  };
}

export interface TherapistAuthResponse extends AuthResponse {
  user: AuthUser & {
    role: UserRole.THERAPIST;
    therapist?: {
      isApproved: boolean;
      approvalStatus: string;
    };
  };
}

export interface AdminAuthResponse extends AuthResponse {
  user: AuthUser & {
    role: UserRole.ADMIN;
    admin?: {
      permissions: string[];
    };
  };
}

export interface ModeratorAuthResponse extends AuthResponse {
  user: AuthUser & {
    role: UserRole.MODERATOR;
    moderator?: {
      permissions: string[];
      assignedCommunities: string[];
    };
  };
}

// Profile responses
export interface ClientProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client';
  dateOfBirth?: string;
  phoneNumber?: string;
  profileComplete: boolean;
  therapistId?: string;
  createdAt: string;
  hasSeenTherapistRecommendations: boolean;
}

// Email responses
export interface EmailResponse {
  success: boolean;
  status?: 'success' | 'error'; // Optional status for compatibility
  message: string;
  sentTo?: string;
}

export interface EmailStatusResponse {
  isVerified: boolean;
  verificationSentAt?: Date;
  canResend: boolean;
}

// OTP responses
export interface OtpEmailData {
  email: string;
  otpCode: string;
  expiresAt: Date;
}

export interface AutoOtpEmailRequest {
  email: string;
  otpCode: string;
  type: 'registration' | 'password_reset' | 'login_verification';
}

// Session responses
export interface SessionInfoResponse {
  sessionId: string;
  userId: string;
  createdAt: Date;
  lastUsedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface ActiveSessionsResponse {
  sessions: SessionInfoResponse[];
  currentSessionId: string;
}

export interface TerminateSessionResponse {
  success: boolean;
  message: string;
  terminatedSessionId: string;
}

export interface TerminateOtherSessionsResponse {
  success: boolean;
  message: string;
  terminatedCount: number;
}

export interface UniversalLogoutResponse {
  success: boolean;
  message: string;
}

export interface CheckUserExistsResponse {
  exists: boolean;
  email?: string;
}

// Onboarding response
export interface OnboardingStatusResponse {
  isFirstSignIn: boolean;
  hasSeenRecommendations: boolean;
  profileCompleted: boolean;
  assessmentCompleted: boolean;
  isOnboardingComplete: boolean;
  completedSteps: string[];
  nextStep?: string;
}

// Success response
export interface SuccessResponse {
  success: boolean;
  message: string;
}

// User response (for user data without tokens)
export interface UserResponse {
  user: AuthUser;
}