// Admin DTOs matching backend exactly

export interface AdminDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin';
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserListParams {
  role?: 'client' | 'therapist' | 'moderator' | 'admin';
  status?: 'active' | 'inactive' | 'suspended';
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: 'createdAt' | 'firstName' | 'lastName' | 'email';
  sortOrder?: 'asc' | 'desc';
}

export interface AdminUserCreateRequest {
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  birthDate: string;
  role: 'client' | 'therapist' | 'moderator' | 'admin';
  isActive: boolean;
  permissions?: string[];
}

export interface AdminUserUpdateRequest {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  birthDate?: string;
  isActive?: boolean;
  permissions?: string[];
}

export interface UserRoleUpdateRequest {
  role: 'client' | 'therapist' | 'moderator' | 'admin';
}

export interface UserSuspendRequest {
  reason?: string;
  duration?: number; // days, 0 = permanent
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalClients: number;
  totalTherapists: number;
  totalModerators: number;
  totalAdmins: number;
  totalPosts: number;
  totalComments: number;
  totalMeetings: number;
  totalWorksheets: number;
  storageUsed: number; // bytes
  serverUptime: number; // seconds
}

export interface UserGrowthParams {
  startDate?: string;
  endDate?: string;
  granularity?: 'day' | 'week' | 'month';
}

export interface UserGrowthData {
  date: string;
  newUsers: number;
  totalUsers: number;
}

export interface EngagementParams {
  startDate?: string;
  endDate?: string;
  granularity?: 'day' | 'week' | 'month';
}

export interface EngagementData {
  date: string;
  activeUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  totalPosts: number;
  totalComments: number;
}

export interface ModerationReport {
  id: string;
  type: 'post' | 'comment' | 'user' | 'message';
  targetId: string;
  reporterId: string;
  reporter: {
    id: string;
    firstName: string;
    lastName: string;
  };
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  assignedTo?: string;
  assignedModerator?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModerationReportParams {
  type?: 'post' | 'comment' | 'user' | 'message';
  status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  assignedTo?: string;
  limit?: number;
  offset?: number;
}

export interface UpdateModerationReportRequest {
  action: 'assign' | 'resolve' | 'dismiss';
  assignedTo?: string;
  resolution?: string;
  notes?: string;
}

export interface FlaggedContent {
  id: string;
  type: 'post' | 'comment';
  content: string;
  authorId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  flagCount: number;
  reasons: string[];
  status: 'pending' | 'approved' | 'removed';
  createdAt: string;
  flaggedAt: string;
}

export interface SystemConfig {
  maxFileSize: number;
  allowedFileTypes: string[];
  sessionTimeout: number;
  maxLoginAttempts: number;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  moderationEnabled: boolean;
  autoModerationEnabled: boolean;
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
  rolloutPercentage?: number;
  targetUsers?: string[];
}

export interface UpdateFeatureFlagRequest {
  enabled: boolean;
  rolloutPercentage?: number;
  targetUsers?: string[];
}