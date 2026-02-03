/**
 * Business domain types for the client-side application
 * These types represent the core business entities and their relationships
 */

// Dashboard response types
interface ModeratorDashboardResponseDto {
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

interface AdminDashboardResponseDto {
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

interface TherapistDashboardResponseDto {
  totalClients: number;
  upcomingAppointments: number;
  completedSessions: number;
  monthlyEarnings: number;
  clientProgress: any[];
  recentMessages: any[];
  scheduleOverview: any[];
}

// Billing types
interface CreatePaymentMethodDto {
  type: 'CARD' | 'BANK_ACCOUNT' | 'DIGITAL_WALLET' | 'GCASH' | 'MAYA' | 'INSURANCE';
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
  
  // Insurance fields
  insuranceProviderName?: string;
  policyNumber?: string;
  memberId?: string;
  groupNumber?: string;
  coverageDetails?: {
    coverageType?: 'FULL' | 'COPAY' | 'PERCENTAGE';
    copayAmount?: number;
    coveragePercentage?: number;
  };
  
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
enum MeetingStatus {
  SCHEDULED = 'scheduled',
  ONGOING = 'ongoing', 
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  MISSED = 'missed',
}

enum MeetingType {
  INITIAL_CONSULTATION = 'initial_consultation',
  THERAPY_SESSION = 'therapy_session',
  FOLLOW_UP = 'follow_up',
  EMERGENCY = 'emergency',
}

enum MeetingDuration {
  THIRTY = 30,
  FORTY_FIVE = 45,
  SIXTY = 60,
  NINETY = 90,
}

// Review-related enums
enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
}

// Application status enum
enum ApplicationStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  INCOMPLETE = 'incomplete',
}

// Session formats
enum SessionFormat {
  IN_PERSON = 'in_person',
  VIDEO_CALL = 'video_call',
  PHONE_CALL = 'phone_call',
  CHAT = 'chat',
  HYBRID = 'hybrid',
}

// OTP types
enum OtpType {
  REGISTRATION = 'registration',
  PASSWORD_RESET = 'password_reset',
  LOGIN_VERIFICATION = 'login_verification',
}

// Worksheet status
enum WorksheetStatus {
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
interface TherapistSpecialization {
  illness: string;
  expertiseLevel: number; // 1-5 scale
  successRate?: number; // 0-100 percentage
}

// Community type
interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isActive: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// Post type - Updated to match backend response structure
interface Post {
  id: string;
  title: string;
  content: string;
  userId: string; // Backend field
  roomId?: string; // Backend field
  attachmentUrls: string[];
  attachmentNames: string[];
  attachmentSizes: number[];
  createdAt: string;
  updatedAt: string;
  
  // Author information (transformed from user field)
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  
  // Room information
  room?: {
    id: string;
    name: string;
  };
  
  // Heart and comment data
  hearts: any[]; // Contains user's heart if they hearted it
  _count: {
    comments: number;
    hearts: number;
  };
  
  // Computed fields for easier access
  heartCount: number;
  commentCount: number;
  isHearted: boolean;
  
  // Comments included in detail views
  comments?: Comment[];
}

// Comment type
interface Comment {
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
interface Worksheet {
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
interface PreAssessment {
  id: string;
  clientId: string;
  questionnaires: string[];
  answers: Record<string, any>;
  scores: Record<string, number>;
  severityLevels: Record<string, string>;
  completedAt?: string;
  createdAt: string;
}