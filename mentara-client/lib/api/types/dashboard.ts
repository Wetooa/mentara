// Dashboard API types for frontend components
// These types represent the transformed data that components consume

import { Contact } from "@/components/messages/types";

// User profile data for dashboard
export interface DashboardUser {
  id: string;
  name: string;
  avatar: string;
  email: string;
  joinDate: string;
}

// Dashboard statistics
export interface DashboardStats {
  completedSessions: number;
  upcomingSessions: number;
  completedWorksheets: number;
  pendingWorksheets: number;
  therapistsConsulted: number;
}

// Progress tracking data
export interface DashboardProgress {
  weeklyMood: {
    date: string;
    value: number; // 1-5 scale
  }[];
  treatmentProgress: number; // percentage
  weeklyEngagement: number; // percentage
}

// Upcoming session data
export interface DashboardSession {
  id: string;
  title: string;
  therapistId: string;
  therapistName: string;
  therapistAvatar?: string;
  dateTime: string;
  duration: number; // minutes
  status: "scheduled" | "started" | "completed" | "cancelled";
  joinUrl?: string;
}

// Worksheet data
export interface DashboardWorksheet {
  id: string;
  title: string;
  assignedDate: string;
  dueDate: string;
  status: "completed" | "pending" | "overdue";
  progress: number; // percentage
  therapistName: string;
}

// Notification data
export interface DashboardNotification {
  id: string;
  type: "session" | "worksheet" | "message" | "system";
  title: string;
  message: string;
  dateTime: string;
  read: boolean;
  actionUrl?: string;
}

// Complete dashboard data interface that components consume
export interface UserDashboardData {
  user: DashboardUser;
  stats: DashboardStats;
  progress: DashboardProgress;
  upcomingSessions: DashboardSession[];
  worksheets: DashboardWorksheet[];
  notifications: DashboardNotification[];
  recentCommunications: Contact[];
}

// Backend API response types (from dashboard service)
export interface ApiDashboardStats {
  completedMeetings: number;
  completedWorksheets: number;
  upcomingMeetings: number;
  pendingWorksheets: number;
}

export interface ApiDashboardClient {
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

export interface ApiDashboardRecentActivity {
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

export interface ApiDashboardResponse {
  client: ApiDashboardClient;
  stats: ApiDashboardStats;
  upcomingMeetings: ApiDashboardClient['meetings'];
  pendingWorksheets: ApiDashboardClient['worksheets'];
  assignedTherapists: ApiDashboardClient['assignedTherapists'];
  recentActivity: ApiDashboardRecentActivity[];
  hasPreAssessment: boolean;
}