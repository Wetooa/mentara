// Dashboard DTOs for all role-specific dashboard endpoints

export interface UserDashboardData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  stats: {
    completedSessions: number;
    upcomingSessions: number;
    completedWorksheets: number;
    pendingWorksheets: number;
    therapistsConsulted: number;
  };
  upcomingSessions: Array<{
    id: string;
    title?: string;
    startTime: string;
    endTime?: string;
    therapist?: {
      userId: string;
      user: {
        firstName: string;
        lastName: string;
      };
    };
  }>;
  worksheets: Array<{
    id: string;
    title: string;
    status: string;
    dueDate?: string;
    completedAt?: string;
  }>;
  progress: {
    overallProgress: number;
    weeklyGoals: number;
    sessionsCompleted: number;
    milestonesReached: number;
  };
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
  }>;
  recentCommunications: Array<{
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
  }>;
}

export interface ClientDashboardResponseDto {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
    joinDate: string;
    preAssessmentCompleted: boolean;
    sessionCount: number;
    lastSessionDate?: string;
  };
  therapist?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
    specializations: string[];
    nextSessionDate?: string;
  };
  sessions: {
    upcoming: number;
    completed: number;
    total: number;
    nextSession?: {
      id: string;
      date: string;
      type: string;
      therapistName: string;
    };
  };
  worksheets: {
    assigned: number;
    completed: number;
    pending: number;
    recent: Array<{
      id: string;
      title: string;
      dueDate: string;
      status: string;
      therapistName: string;
    }>;
  };
  wellness: {
    currentMoodScore?: number;
    moodTrend: 'improving' | 'stable' | 'declining';
    weeklyProgress: number;
    goalProgress?: {
      current: number;
      target: number;
      percentage: number;
    };
  };
  notifications: {
    unread: number;
    recent: Array<{
      id: string;
      title: string;
      message: string;
      type: string;
      createdAt: string;
    }>;
  };
  recommendations?: {
    newRecommendationsSeen: boolean;
  };
}

export interface TherapistDashboardResponseDto {
  therapist: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
    approvalStatus: string;
    joinDate: string;
    specializations: string[];
  };
  patients: {
    active: number;
    total: number;
    newRequests: number;
    recent: Array<{
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl: string;
      lastSessionDate?: string;
      nextSessionDate?: string;
      status: string;
    }>;
  };
  schedule: {
    today: Array<{
      id: string;
      patientName: string;
      startTime: string;
      endTime: string;
      type: string;
      status: string;
    }>;
    thisWeek: Array<{
      id: string;
      patientName: string;
      date: string;
      startTime: string;
      type: string;
    }>;
    upcomingCount: number;
  };
  earnings: {
    thisMonth: number;
    lastMonth: number;
    percentageChange: number;
    totalEarnings: number;
    pendingPayouts: number;
  };
  performance: {
    averageRating: number;
    totalRatings: number;
    sessionCompletionRate: number;
    responseTime: number; // in hours
  };
}

export interface AdminDashboardResponseDto {
  platform: {
    totalUsers: number;
    activeUsers: number;
    newSignups: number;
    userGrowth: number;
  };
  therapists: {
    totalTherapists: number;
    pendingApplications: number;
    approvedTherapists: number;
    rejectedApplications: number;
  };
  sessions: {
    totalSessions: number;
    activeSessions: number;
    sessionGrowth: number;
    averageSessionDuration: number;
  };
  financial: {
    totalRevenue: number;
    monthlyRevenue: number;
    revenueGrowth: number;
    pendingPayouts: number;
  };
  system: {
    systemHealth: 'healthy' | 'warning' | 'critical';
    uptime: string;
    activeConnections: number;
    errorRate: number;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    user: string;
    timestamp: string;
    details: string;
  }>;
}

export interface ModeratorDashboardResponseDto {
  moderator: {
    id: string;
    firstName: string;
    lastName: string;
    assignedCommunities: string[];
    permissions: string[];
  };
  moderation: {
    pendingReports: number;
    resolvedToday: number;
    totalReports: number;
    averageResponseTime: number; // in hours
  };
  communities: {
    totalCommunities: number;
    activeCommunities: number;
    totalMembers: number;
    newMembersToday: number;
  };
  content: {
    postsToday: number;
    commentsToday: number;
    flaggedContent: number;
    removedContent: number;
  };
  queue: Array<{
    id: string;
    type: 'post' | 'comment' | 'user';
    reportReason: string;
    reporter: string;
    createdAt: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}