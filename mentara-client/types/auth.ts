// Shared authentication types for the Mentara platform
import { MeetingType } from "./booking";

export type UserRole = "client" | "therapist" | "admin" | "moderator";

// Base user interface
export interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Client-specific types
export interface ClientPreferences {
  language: string;
  timezone: string;
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  therapyPreferences: {
    sessionType: MeetingType | "in-person";
    sessionDuration: 30 | 45 | 60 | 90;
    reminderTiming: number; // minutes before session
  };
  privacySettings: {
    shareProgressWithTherapist: boolean;
    allowDataForResearch: boolean;
  };
}

export interface AssessmentResults {
  assessmentId: string;
  completedAt: string;
  scores: {
    [scaleId: string]: {
      rawScore: number;
      percentile: number;
      severity: "minimal" | "mild" | "moderate" | "severe";
    };
  };
  recommendations: string[];
  riskFlags: string[];
}

export interface ClientProfile {
  dateOfBirth?: string;
  gender?: string;
  goals: string[];
  preferences?: ClientPreferences;
  assessmentResults?: AssessmentResults;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface ClientUser extends BaseUser {
  role: "client";
  isOnboardingComplete: boolean;
  profile: ClientProfile;
}

// Therapist-specific types
export interface AvailabilitySchedule {
  [dayOfWeek: string]: {
    isAvailable: boolean;
    slots: {
      startTime: string; // HH:MM format
      endTime: string; // HH:MM format
      isBookable: boolean;
    }[];
  };
}

export interface TherapistLicense {
  licenseNumber: string;
  licenseType: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  isVerified: boolean;
}

export interface TherapistProfile {
  bio: string;
  specializations: string[];
  credentials: string[];
  experience: number; // years
  languages: string[];
  availability: AvailabilitySchedule;
  hourlyRate?: number;
  isAcceptingNewClients: boolean;
  license: TherapistLicense;
  verificationDocuments?: {
    diplomaUrl?: string;
    licenseUrl?: string;
    certificationUrls?: string[];
  };
}

export interface Appointment {
  id: string;
  clientId: string;
  therapistId: string;
  scheduledAt: string;
  duration: number; // minutes
  type: MeetingType | "in-person";
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  meetingUrl?: string;
  notes?: string;
  client: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface TherapistUser extends BaseUser {
  role: "therapist";
  approvalStatus: "pending" | "approved" | "rejected" | "suspended";
  isApproved: boolean;
  profile: TherapistProfile;
}

// Admin-specific types
export interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  newSignups: number;
  userGrowth: number;
  totalTherapists: number;
  pendingApplications: number;
  approvedTherapists: number;
  rejectedApplications: number;
  totalSessions: number;
  activeSessions: number;
  systemHealth: "healthy" | "warning" | "critical";
  uptime: string;
}

export interface AdminActivity {
  id: string;
  adminId: string;
  action: string;
  targetType: "user" | "therapist" | "system" | "setting";
  targetId?: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userRole: UserRole;
  action: string;
  resourceType: string;
  resourceId?: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, unknown>;
  severity: "low" | "medium" | "high" | "critical";
}

export interface SecurityEvent {
  id: string;
  type: "failed_login" | "suspicious_activity" | "data_breach" | "unauthorized_access";
  severity: "low" | "medium" | "high" | "critical";
  userId?: string;
  ipAddress: string;
  timestamp: string;
  description: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface AdminProfile {
  permissions: string[];
  isSuperAdmin: boolean;
  lastLoginAt?: string;
  securityClearance: "standard" | "elevated" | "maximum";
}

export interface AdminUser extends BaseUser {
  role: "admin";
  profile: AdminProfile;
  permissions: string[];
  isSuperAdmin: boolean;
}

// Moderator-specific types
export interface CommunityInfo {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isActive: boolean;
  category: string;
  createdAt: string;
  moderatorIds: string[];
}

export interface ModerationAction {
  id: string;
  moderatorId: string;
  type: "warn" | "mute" | "ban" | "delete_post" | "delete_comment" | "approve";
  targetType: "user" | "post" | "comment";
  targetId: string;
  reason: string;
  timestamp: string;
  communityId: string;
  duration?: number; // for temporary actions (minutes)
  isReversed: boolean;
}

export interface ModerationQueueItem {
  id: string;
  type: "report" | "flagged_content" | "appeal";
  priority: "low" | "medium" | "high" | "urgent";
  contentType: "post" | "comment" | "user_profile";
  contentId: string;
  reporterId?: string;
  reason: string;
  description: string;
  status: "pending" | "in_review" | "resolved" | "escalated";
  assignedTo?: string;
  communityId: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface CommunityStatistics {
  communityId: string;
  name: string;
  totalPosts: number;
  totalComments: number;
  activeMembers: number;
  flaggedContent: number;
  resolvedReports: number;
  averageResolutionTime: number; // hours
}

export interface ModerationGuideline {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: "low" | "medium" | "high";
  action: "warn" | "mute" | "ban" | "delete";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ModeratorProfile {
  permissions: string[];
  assignedCommunities: string[];
  moderationLevel: "junior" | "senior" | "lead";
  performanceMetrics: {
    resolvedReports: number;
    averageResolutionTime: string;
    userSatisfactionScore: number;
  };
}

export interface ModeratorUser extends BaseUser {
  role: "moderator";
  profile: ModeratorProfile;
  permissions: string[];
  assignedCommunities: string[];
  moderationLevel: "junior" | "senior" | "lead";
}

// Shared auth types
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse<T = BaseUser> {
  user: T;
  tokens: TokenPair;
  isFirstLogin?: boolean;
}

// Query parameter types
export interface AuditLogQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  resourceType?: string;
  severity?: "low" | "medium" | "high" | "critical";
  startDate?: string;
  endDate?: string;
}

export interface ModerationQueueQueryParams {
  page?: number;
  limit?: number;
  status?: "pending" | "in_review" | "resolved" | "escalated";
  priority?: "low" | "medium" | "high" | "urgent";
  communityId?: string;
  assignedTo?: string;
  type?: "report" | "flagged_content" | "appeal";
}

// Union types for role-based operations
export type RoleSpecificUser = ClientUser | TherapistUser | AdminUser | ModeratorUser;

export type UserByRole<T extends UserRole> = 
  T extends "client" ? ClientUser :
  T extends "therapist" ? TherapistUser :
  T extends "admin" ? AdminUser :
  T extends "moderator" ? ModeratorUser :
  never;

// Error types
export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Verification types
export interface VerificationStatus {
  documentsVerified: boolean;
  licenseVerified: boolean;
  backgroundCheckComplete: boolean;
  overallStatus: "verified" | "pending" | "rejected";
}

export interface EmailVerificationRequest {
  email: string;
  userId?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmation {
  token: string;
  newPassword: string;
}