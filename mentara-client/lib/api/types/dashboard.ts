// Dashboard-related type definitions

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
  user: UserDashboardData['user'];
  stats: UserDashboardData['stats'];
  upcomingSessions: UserDashboardData['upcomingSessions'];
  worksheets: UserDashboardData['worksheets'];
  progress: UserDashboardData['progress'];
  assignedTherapists: Array<{
    userId: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      profilePicture?: string;
    };
    specializations: string[];
    verified: boolean;
  }>;
}

export interface TherapistDashboardResponseDto {
  user: UserDashboardData['user'];
  stats: {
    totalClients: number;
    upcomingSessions: number;
    completedSessions: number;
    pendingWorksheets: number;
    monthlyEarnings: number;
  };
  upcomingSessions: UserDashboardData['upcomingSessions'];
  clients: Array<{
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    lastSession?: string;
    nextSession?: string;
    progress: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export interface AdminDashboardResponseDto {
  user: UserDashboardData['user'];
  stats: {
    totalUsers: number;
    totalTherapists: number;
    totalSessions: number;
    monthlyRevenue: number;
    pendingApplications: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: string;
    activeUsers: number;
  };
}

export interface ModeratorDashboardResponseDto {
  user: UserDashboardData['user'];
  stats: {
    pendingReports: number;
    resolvedReports: number;
    activeCommunities: number;
    flaggedContent: number;
  };
  pendingReports: Array<{
    id: string;
    type: string;
    description: string;
    reporter: string;
    timestamp: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    target: string;
    timestamp: string;
  }>;
}