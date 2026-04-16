/**
 * Admin API Type Definitions
 * 
 * This file contains all type definitions for admin-related API operations,
 * specifically for therapist application management. All types are synchronized
 * with the NestJS backend AdminTherapistController DTOs and Prisma schema.
 * 
 * Key Features:
 * - Exact backend DTO synchronization
 * - Complete type safety for all CRUD operations
 * - Support for filtering, pagination, and status management
 * - Comprehensive error handling types
 * 
 * @version 2.0.0
 * @lastUpdated 2025-01-22 - Full type synchronization complete
 * @maintainer Frontend Architecture Team
 */

// User roles enum (matching backend)
export type UserRole = 'client' | 'therapist' | 'moderator' | 'admin';

// Therapist application status (matching Prisma enum)
export type TherapistApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

// =============================
// BASE INTERFACES (from Prisma schema)
// =============================

/**
 * User interface matching backend User model
 */
export interface UserBase {
  id: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  birthDate?: string;
  address?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  password?: never; // Never expose password in frontend
  emailVerified: boolean;
  isActive: boolean;
  isVerified: boolean;
  failedLoginCount: number;
  avatarUrl?: string;
  coverImageUrl?: string;
  bio?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  suspensionReason?: string;
  deactivatedAt?: string;
  deactivatedBy?: string;
  deactivationReason?: string;
  lastLoginAt?: string;
  lockoutUntil?: string;
}

/**
 * Admin interface matching backend Admin model
 */
export interface AdminBase {
  userId: string;
  permissions: string[];
  adminLevel: string;
  createdAt: string;
  updatedAt: string;
  user?: UserBase;
}

/**
 * Full Therapist interface matching backend Therapist model with relations
 */
export interface TherapistApplication {
  // User relation
  userId: string;
  user: UserBase;

  // Contact information
  mobile: string;
  province: string;
  timezone: string;

  // Application status
  status: TherapistApplicationStatus;
  submissionDate: string;
  processingDate: string;

  processedByAdminId?: string;
  processedByAdmin?: AdminBase;

  // Professional credentials
  providerType: string;
  professionalLicenseType: string;
  isPRCLicensed: string;
  prcLicenseNumber: string;
  expirationDateOfLicense: string;
  practiceStartDate: string;

  // License verification
  licenseVerified: boolean;
  licenseVerifiedAt?: string;
  licenseVerifiedBy?: string;

  // Additional certifications
  certifications?: any; // JSON field

  // Document uploads
  certificateUrls: string[];
  certificateNames: string[];
  licenseUrls: string[];
  licenseNames: string[];
  documentUrls: string[];
  documentNames: string[];

  // Professional background
  yearsOfExperience?: number;
  educationBackground?: string;
  specialCertifications: string[];

  // Practice details
  practiceLocation?: string;
  acceptsInsurance: boolean;
  acceptedInsuranceTypes: string[];

  // Professional expertise
  areasOfExpertise: string[];
  assessmentTools: string[];
  therapeuticApproachesUsedList: string[];
  languagesOffered: string[];

  // Online therapy preferences
  providedOnlineTherapyBefore: boolean;
  comfortableUsingVideoConferencing: boolean;
  preferredSessionLength: number[];

  // Compliance and guidelines
  privateConfidentialSpace?: string;
  compliesWithDataPrivacyAct: boolean;
  professionalLiabilityInsurance?: string;
  complaintsOrDisciplinaryActions?: string;
  willingToAbideByPlatformGuidelines: boolean;

  // Specializations and approaches
  expertise: string[];
  approaches: string[];
  languages: string[];
  illnessSpecializations: string[];
  acceptTypes: string[];
  treatmentSuccessRates: any; // JSON field

  // Session details
  sessionLength: string;
  hourlyRate: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Relations (optional for some responses)
  assignedClients?: any[];
  reviews?: any[];
}

/**
 * Statistics interface for application details
 */
export interface TherapistApplicationStatistics {
  totalClients: number;
  averageRating: number;
  totalReviews: number;
}

// === Admin User Management DTOs ===
export interface AdminUpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  bio?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  gender?: string;
  location?: string;
}

export interface AdminUserQuery {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// === Admin Therapist Management DTOs ===
export interface AdminUpdateTherapistDto {
  status?: TherapistApplicationStatus;
  areasOfExpertise?: string[];
  hourlyRate?: number;
  yearsOfExperience?: number;
  licenseNumber?: string;
  licenseType?: string;
  education?: string[];
  certifications?: string[];
  languages?: string[];
  province?: string;
  city?: string;
  timezone?: string;
  profileSummary?: string;
}

export interface AdminTherapistQuery {
  search?: string;
  status?: TherapistApplicationStatus;
  specialties?: string[];
  location?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// === Therapist Application Action DTOs ===
/**
 * DTO for approving therapist application (matches backend ApproveTherapistDtoSchema)
 */
export interface ApproveTherapistDto {
  reason?: string;
  welcomeMessage?: string;
  verifyLicense?: boolean; // Used in service for licenseVerified field
  approvalMessage?: string;
}

/**
 * DTO for rejecting therapist application (matches backend RejectTherapistDtoSchema)
 */
export interface RejectTherapistDto {
  reason: string; // Required field (min 1 char) in backend validation
  rejectionMessage?: string;
  allowReapplication?: boolean;
  rejectionReason?: string; // Used for notification customization
}

export interface UpdateTherapistStatusDto {
  status: TherapistApplicationStatus;
  reason?: string;
  notes?: string;
}

export interface PendingTherapistFiltersDto {
  search?: string;
  status?: TherapistApplicationStatus; // Match backend enum validation
  province?: string;
  submittedAfter?: string;
  processedBy?: string;
  providerType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number; // Backend validates max 100
}

// =============================
// ADMIN RESPONSE DTOS (matching backend transformers)
// =============================

/**
 * Response for therapist application list (from AdminResponseTransformer.transformTherapistList)
 */
export interface TherapistListResponse {
  therapists: TherapistApplication[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Response for detailed therapist application (from AdminResponseTransformer.transformApplicationDetails)
 */
export interface TherapistApplicationDetailsResponse {
  id: string;
  status: string;
  submittedAt: string;
  user: UserBase;
  application: TherapistApplication & {
    statistics: TherapistApplicationStatistics;
  };
}

/**
 * Response for therapist actions (approve/reject/status update)
 */
export interface TherapistActionResponse {
  success: boolean;
  message: string;
  therapistId: string;
}

/**
 * Response for therapist application metrics (from AdminResponseTransformer.transformApplicationMetrics)
 */
export interface TherapistApplicationMetricsResponse {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
}

/**
 * Extended response that matches backend service getTherapistApplicationMetrics
 */
export interface TherapistApplicationMetricsExtended {
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
    processedApplications: number;
  };
  metrics: {
    approvalRate: number;
    averageProcessingTimeDays: number;
    applicationTrend: 'increasing' | 'decreasing' | 'stable';
  };
  recentActivity: Array<{
    submissionDate: string;
    status: string;
    processingDate?: string;
  }>;
}

/**
 * Service response for getPendingApplications method
 */
export interface PendingApplicationsServiceResponse {
  applications: TherapistApplication[];
  summary: {
    totalPending: number;
    totalApproved: number;
    totalRejected: number;
    filtered: number;
  };
  filters: PendingTherapistFiltersDto;
}

// === Admin Account Management ===
export interface CreateAdminAccountDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'moderator';
}

export interface CreateAdminDto {
  userId: string;
  permissions: string[];
  adminLevel?: string;
}

export interface UpdateAdminDto {
  permissions?: string[];
  adminLevel?: string;
}

export interface AdminResponseDto {
  userId: string;
  permissions: string[];
  adminLevel: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminAccountQuery {
  search?: string;
  role?: 'admin' | 'moderator';
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// === Application Status Update (from therapist interfaces) ===
export interface ApplicationStatusUpdateDto {
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  adminNotes?: string;
  credentials?: {
    email: string;
    temporaryPassword: string;
  };
}