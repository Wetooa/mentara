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

interface TherapistAuthResponse extends AuthResponse {
  user: AuthUser & {
    role: UserRole.THERAPIST;
    therapist?: {
      isApproved: boolean;
      approvalStatus: string;
    };
  };
}

interface AdminAuthResponse extends AuthResponse {
  user: AuthUser & {
    role: UserRole.ADMIN;
    admin?: {
      permissions: string[];
    };
  };
}

interface ModeratorAuthResponse extends AuthResponse {
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
  avatarUrl?: string;
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

interface EmailStatusResponse {
  emailVerified: boolean;
  verificationSentAt?: Date;
  canResend: boolean;
}

// OTP responses
interface OtpEmailData {
  email: string;
  otpCode: string;
  expiresAt: Date;
}

interface AutoOtpEmailRequest {
  email: string;
  otpCode: string;
  type: 'registration' | 'password_reset' | 'login_verification';
}

// Session responses
interface SessionInfoResponse {
  sessionId: string;
  userId: string;
  createdAt: Date;
  lastUsedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

interface ActiveSessionsResponse {
  sessions: SessionInfoResponse[];
  currentSessionId: string;
}

interface TerminateSessionResponse {
  success: boolean;
  message: string;
  terminatedSessionId: string;
}

interface TerminateOtherSessionsResponse {
  success: boolean;
  message: string;
  terminatedCount: number;
}

interface UniversalLogoutResponse {
  success: boolean;
  message: string;
}

interface CheckUserExistsResponse {
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

// User response (for user data without tokens)
export interface UserResponse {
  user: AuthUser;
}
