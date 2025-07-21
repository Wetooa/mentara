/**
 * Business domain types for the client-side application
 * These types represent the core business entities and their relationships
 */

// User roles enum
export enum UserRole {
  CLIENT = 'client',
  THERAPIST = 'therapist',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

// Meeting-related enums
export enum MeetingStatus {
  SCHEDULED = 'scheduled',
  ONGOING = 'ongoing', 
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  MISSED = 'missed',
}

export enum MeetingType {
  INITIAL_CONSULTATION = 'initial_consultation',
  THERAPY_SESSION = 'therapy_session',
  FOLLOW_UP = 'follow_up',
  EMERGENCY = 'emergency',
}

export enum MeetingDuration {
  THIRTY = 30,
  FORTY_FIVE = 45,
  SIXTY = 60,
  NINETY = 90,
}

// Review-related enums
export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
}

// Application status enum
export enum ApplicationStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  INCOMPLETE = 'incomplete',
}

// Session formats
export enum SessionFormat {
  IN_PERSON = 'in_person',
  VIDEO_CALL = 'video_call',
  PHONE_CALL = 'phone_call',
  CHAT = 'chat',
  HYBRID = 'hybrid',
}

// OTP types
export enum OtpType {
  REGISTRATION = 'registration',
  PASSWORD_RESET = 'password_reset',
  LOGIN_VERIFICATION = 'login_verification',
}

// Worksheet status
export enum WorksheetStatus {
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
}

// Base user interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isEmailVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Therapist specialization
export interface TherapistSpecialization {
  illness: string;
  expertiseLevel: number; // 1-5 scale
  successRate?: number; // 0-100 percentage
}

// Community type
export interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isActive: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// Post type
export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  communityId: string;
  isAnonymous: boolean;
  heartCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

// Comment type
export interface Comment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  parentId?: string;
  heartCount: number;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

// Worksheet type
export interface Worksheet {
  id: string;
  title: string;
  description: string;
  instructions: string;
  type: string;
  difficulty: string;
  status: WorksheetStatus;
  assignedAt: string;
  dueDate?: string;
  completedAt?: string;
}

// Pre-assessment type
export interface PreAssessment {
  id: string;
  clientId: string;
  questionnaires: string[];
  answers: Record<string, any>;
  scores: Record<string, number>;
  severityLevels: Record<string, string>;
  completedAt?: string;
  createdAt: string;
}