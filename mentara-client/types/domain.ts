/**
 * Business domain types for the client-side application
 * These types represent the core business entities and their relationships
 */

// Dashboard response types
export interface ModeratorDashboardResponseDto {
  pendingReports: number;
  resolvedReports: number;
  totalCommunities: number;
  activeModerators: number;
  recentActivity: any[];
  communityStats: any[];
  performanceMetrics: {
    averageResponseTime: number;
    userSatisfactionScore: number;
    contentFlagged: number;
    actionsToday: number;
  };
}

export interface AdminDashboardResponseDto {
  totalUsers: number;
  totalTherapists: number;
  totalClients: number;
  pendingApplications: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  revenueMetrics: {
    monthlyRevenue: number;
    yearlyRevenue: number;
    averageSessionCost: number;
    paymentFailures: number;
  };
  userActivity: {
    activeUsers: number;
    newRegistrations: number;
    sessionCount: number;
    retentionRate: number;
  };
}

export interface TherapistDashboardResponseDto {
  totalClients: number;
  upcomingAppointments: number;
  completedSessions: number;
  monthlyEarnings: number;
  clientProgress: any[];
  recentMessages: any[];
  scheduleOverview: any[];
}

// Billing types
export interface CreatePaymentMethodDto {
  type: 'CARD' | 'BANK_ACCOUNT' | 'DIGITAL_WALLET' | 'GCASH' | 'MAYA';
  nickname?: string;
  
  // Card fields
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
  
  // Bank account fields
  accountNumber?: string;
  bankName?: string;
  accountHolderName?: string;
  accountType?: string;
  routingNumber?: string;
  
  // Digital wallet fields
  walletProvider?: string;
  walletEmail?: string;
  walletAccountName?: string;
  
  // GCash fields
  gcashNumber?: string;
  gcashName?: string;
  gcashEmail?: string;
  
  // Maya fields
  mayaNumber?: string;
  mayaName?: string;
  mayaEmail?: string;
  
  // Address
  billingAddress?: any;
  routingNumber?: string;
  accountName?: string;
  isDefault?: boolean;
}

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
  ASSIGNED = 'ASSIGNED',
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
  OVERDUE = 'OVERDUE',
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