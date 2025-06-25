import { UserRole } from '../utils/role-utils';

// Base User interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate?: Date;
  address?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Auth DTOs
export interface RegisterUserDto {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  middleName?: string;
  birthDate?: Date;
  address?: string;
}

export interface RegisterTherapistDto extends RegisterUserDto {
  mobile: string;
  province: string;
  providerType: string;
  professionalLicenseType: string;
  isPRCLicensed: string;
  prcLicenseNumber: string;
  expirationDateOfLicense?: Date;
  isLicenseActive: string;
  yearsOfExperience: string;
  areasOfExpertise: Record<string, any>;
  assessmentTools: Record<string, any>;
  therapeuticApproachesUsedList: Record<string, any>;
  languagesOffered: Record<string, any>;
  providedOnlineTherapyBefore: string;
  comfortableUsingVideoConferencing: string;
  weeklyAvailability: string;
  preferredSessionLength: string;
  accepts: Record<string, any>;
  privateConfidentialSpace: string;
  compliesWithDataPrivacyAct: string;
  professionalLiabilityInsurance: string;
  complaintsOrDisciplinaryActions: string;
  willingToAbideByPlatformGuidelines: string;
}

// Community DTOs
export interface CreateCommunityDto {
  name: string;
  description: string;
  slug?: string;
  illness?: string;
  isPrivate?: boolean;
}

export interface UpdateCommunityDto {
  name?: string;
  description?: string;
  slug?: string;
  illness?: string;
  isActive?: boolean;
  isPrivate?: boolean;
}

export interface CommunityResponse {
  id: string;
  name: string;
  description: string;
  slug: string;
  illness?: string;
  isActive: boolean;
  isPrivate: boolean;
  memberCount: number;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
  isMember?: boolean;
  userRole?: string;
}

export interface CommunityWithMembers extends CommunityResponse {
  members: {
    id: string;
    userId: string;
    role: string;
    joinedAt: Date;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string;
    };
  }[];
}

export interface CommunityStats {
  totalCommunities: number;
  totalMembers: number;
  totalPosts: number;
  activeCommunities: number;
  illnessCommunities: {
    illness: string;
    communityCount: number;
    memberCount: number;
  }[];
}

// Post DTOs
export interface CreatePostDto {
  title: string;
  content: string;
  authorId: string;
  communityId?: string;
  isAnonymous?: boolean;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  isAnonymous?: boolean;
}

// Comment DTOs
export interface CreateCommentDto {
  content: string;
  authorId: string;
  postId: string;
  parentId?: string;
  isAnonymous?: boolean;
}

export interface UpdateCommentDto {
  content?: string;
  isAnonymous?: boolean;
}

// Worksheet DTOs
export interface CreateWorksheetDto {
  title: string;
  description: string;
  content: string;
  type: 'assessment' | 'exercise' | 'homework';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedDuration: number; // in minutes
  therapistId?: string;
  tags?: string[];
}

export interface UpdateWorksheetDto {
  title?: string;
  description?: string;
  content?: string;
  type?: 'assessment' | 'exercise' | 'homework';
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedDuration?: number;
  tags?: string[];
}

export interface CreateSubmissionDto {
  worksheetId: string;
  userId: string;
  answers: Record<string, any>;
  completedAt?: Date;
}

export interface SubmitWorksheetDto {
  answers: Record<string, any>;
  completedAt?: Date;
}

// Therapist Application DTOs
export interface CreateTherapistApplicationDto {
  clerkUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  province: string;
  providerType: string;
  professionalLicenseType: string;
  isPRCLicensed: string;
  prcLicenseNumber: string;
  expirationDateOfLicense?: Date;
  isLicenseActive: string;
  yearsOfExperience: string;
  areasOfExpertise: Record<string, any>;
  assessmentTools: Record<string, any>;
  therapeuticApproachesUsedList: Record<string, any>;
  languagesOffered: Record<string, any>;
  providedOnlineTherapyBefore: string;
  comfortableUsingVideoConferencing: string;
  weeklyAvailability: string;
  preferredSessionLength: string;
  accepts: Record<string, any>;
  privateConfidentialSpace: string;
  compliesWithDataPrivacyAct: string;
  professionalLiabilityInsurance: string;
  complaintsOrDisciplinaryActions: string;
  willingToAbideByPlatformGuidelines: string;
  uploadedDocuments?: Record<string, any>;
  applicationData?: Record<string, any>;
}

export interface UpdateTherapistApplicationDto {
  status?: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Error types
export interface ApiError {
  message: string;
  statusCode: number;
  error: string;
  timestamp: string;
}

// Query parameters
export interface PaginationQuery {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface FilterQuery {
  status?: string;
  userId?: string;
  therapistId?: string;
  communityId?: string;
  postId?: string;
  type?: string;
  difficulty?: string;
}

// PreAssessment Types
export interface PreAssessmentData {
  questionnaires: string[];
  answers: number[][];
  answerMatrix: number[];
  scores: Record<string, number>;
  severityLevels: Record<string, string>;
}

export interface CreatePreAssessmentDto {
  questionnaires: string[];
  answers: number[][];
  answerMatrix: number[];
  scores: Record<string, number>;
  severityLevels: Record<string, string>;
}

export interface PreAssessmentResponse {
  id: string;
  userId: string;
  clerkId: string;
  questionnaires: string[];
  answers: number[][];
  answerMatrix: number[];
  scores: Record<string, number>;
  severityLevels: Record<string, string>;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Therapist Specialization Types
export interface TherapistSpecialization {
  illness: string;
  expertiseLevel: number; // 1-5 scale
  successRate?: number; // 0-100 percentage
  yearsOfExperience: number;
}

export interface TherapistRecommendation {
  id: string;
  clerkUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  profileImageUrl?: string;
  hourlyRate?: number;
  patientSatisfaction?: number;
  totalPatients: number;
  province: string;
  providerType: string;
  yearsOfExperience?: number;

  // Matching data
  matchedConditions: string[];
  matchScore: number; // 0-100 percentage
  expertiseLevels: Record<string, number>;
  therapeuticApproaches: string[];
  languages: string[];
  weeklyAvailability?: string;
  sessionLength?: string;
}

export interface TherapistRecommendationRequest {
  userId: string;
  limit?: number;
  includeInactive?: boolean;
  province?: string;
  maxHourlyRate?: number;
}

export interface TherapistRecommendationResponse {
  recommendations: TherapistRecommendation[];
  totalCount: number;
  userConditions: string[];
  matchCriteria: {
    primaryConditions: string[];
    secondaryConditions: string[];
    severityLevels: Record<string, string>;
  };
}
