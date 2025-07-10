import { AxiosInstance } from 'axios';

// Backend response interfaces based on the actual API structure
export interface DashboardStats {
  completedMeetings: number;
  completedWorksheets: number;
  upcomingMeetings: number;
  pendingWorksheets: number;
}

export interface DashboardClient {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    createdAt: string;
  };
  assignedTherapists: Array<{
    id: string;
    userId: string;
    user: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      imageUrl?: string;
    };
    specializations?: string[];
    hourlyRate?: number;
    status: string;
  }>;
  meetings: Array<{
    id: string;
    title?: string;
    startTime: string;
    duration: number;
    status: string;
    therapist: {
      id: string;
      userId: string;
      user: {
        id: string;
        firstName?: string;
        lastName?: string;
      };
    };
  }>;
  worksheets: Array<{
    id: string;
    title: string;
    description?: string;
    assignedDate: string;
    dueDate?: string;
    isCompleted: boolean;
    progress?: number;
    therapist: {
      id: string;
      userId: string;
      user: {
        id: string;
        firstName?: string;
        lastName?: string;
      };
    };
  }>;
  preAssessment?: {
    id: string;
    isCompleted: boolean;
    completedAt?: string;
  };
}

export interface DashboardRecentActivity {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  room: {
    roomGroup: {
      community: {
        name: string;
      };
    };
  };
  _count: {
    hearts: number;
    comments: number;
  };
}

export interface DashboardResponse {
  client: DashboardClient;
  stats: DashboardStats;
  upcomingMeetings: DashboardClient['meetings'];
  pendingWorksheets: DashboardClient['worksheets'];
  assignedTherapists: DashboardClient['assignedTherapists'];
  recentActivity: DashboardRecentActivity[];
  hasPreAssessment: boolean;
}

export interface DashboardService {
  getUserDashboard: () => Promise<DashboardResponse>;
}

export const createDashboardService = (client: AxiosInstance): DashboardService => ({
  // Get current user's dashboard data
  getUserDashboard: (): Promise<DashboardResponse> =>
    client.get('/dashboard/user'),
});