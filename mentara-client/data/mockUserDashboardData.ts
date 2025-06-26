import { Contact } from "@/components/messages/types";

export interface UserDashboardData {
  user: {
    id: string;
    name: string;
    avatar: string;
    email: string;
    joinDate: string;
  };
  stats: {
    completedSessions: number;
    upcomingSessions: number;
    completedWorksheets: number;
    pendingWorksheets: number;
    therapistsConsulted: number;
  };
  progress: {
    weeklyMood: {
      date: string;
      value: number; // 1-5 scale
    }[];
    treatmentProgress: number; // percentage
    weeklyEngagement: number; // percentage
  };
  upcomingSessions: {
    id: string;
    title: string;
    therapistId: string;
    therapistName: string;
    therapistAvatar?: string;
    dateTime: string;
    duration: number; // minutes
    status: "scheduled" | "started" | "completed" | "cancelled";
    joinUrl?: string;
  }[];
  worksheets: {
    id: string;
    title: string;
    assignedDate: string;
    dueDate: string;
    status: "completed" | "pending" | "overdue";
    progress: number; // percentage
    therapistName: string;
  }[];
  notifications: {
    id: string;
    type: "session" | "worksheet" | "message" | "system";
    title: string;
    message: string;
    dateTime: string;
    read: boolean;
    actionUrl?: string;
  }[];
  recentCommunications: Contact[];
}

export const mockUserDashboardData: UserDashboardData = {
  user: {
    id: "user-001",
    name: "Jane Doe",
    avatar: "/laine.jpg",
    email: "jane.doe@example.com",
    joinDate: "2025-01-15",
  },
  stats: {
    completedSessions: 8,
    upcomingSessions: 3,
    completedWorksheets: 12,
    pendingWorksheets: 4,
    therapistsConsulted: 2,
  },
  progress: {
    weeklyMood: [
      { date: "2025-05-10", value: 3 },
      { date: "2025-05-11", value: 3 },
      { date: "2025-05-12", value: 4 },
      { date: "2025-05-13", value: 2 },
      { date: "2025-05-14", value: 3 },
      { date: "2025-05-15", value: 4 },
      { date: "2025-05-16", value: 4 },
    ],
    treatmentProgress: 65,
    weeklyEngagement: 80,
  },
  upcomingSessions: [
    {
      id: "m1",
      title: "CBT Session",
      therapistId: "1",
      therapistName: "Dr. Sarah Johnson",
      dateTime: "2025-05-16T15:30:00",
      duration: 45,
      status: "scheduled",
      joinUrl: "/session/join/m1",
    },
    {
      id: "m2",
      title: "Family Therapy",
      therapistId: "3",
      therapistName: "Dr. Olivia Rodriguez",
      dateTime: "2025-05-18T16:00:00",
      duration: 60,
      status: "scheduled",
    },
    {
      id: "m3",
      title: "Initial Consultation",
      therapistId: "2",
      therapistName: "Dr. Michael Chen",
      dateTime: "2025-05-23T11:00:00",
      duration: 60,
      status: "scheduled",
    },
  ],
  worksheets: [
    {
      id: "ws-001",
      title: "Weekly Mood Journal",
      assignedDate: "2025-05-09",
      dueDate: "2025-05-16",
      status: "pending",
      progress: 50,
      therapistName: "Dr. Sarah Johnson",
    },
    {
      id: "ws-002",
      title: "Cognitive Distortions Worksheet",
      assignedDate: "2025-05-10",
      dueDate: "2025-05-17",
      status: "pending",
      progress: 25,
      therapistName: "Dr. Sarah Johnson",
    },
    {
      id: "ws-003",
      title: "Stress Management Techniques",
      assignedDate: "2025-05-05",
      dueDate: "2025-05-12",
      status: "overdue",
      progress: 75,
      therapistName: "Dr. Michael Chen",
    },
    {
      id: "ws-004",
      title: "Family Communication Exercise",
      assignedDate: "2025-04-28",
      dueDate: "2025-05-05",
      status: "completed",
      progress: 100,
      therapistName: "Dr. Olivia Rodriguez",
    },
  ],
  notifications: [
    {
      id: "notif-001",
      type: "session",
      title: "Upcoming Session",
      message: "Your session with Dr. Sarah Johnson starts in 30 minutes",
      dateTime: "2025-05-16T15:00:00",
      read: false,
      actionUrl: "/session/join/m1",
    },
    {
      id: "notif-002",
      type: "worksheet",
      title: "Worksheet Reminder",
      message: "Your 'Weekly Mood Journal' is due today",
      dateTime: "2025-05-16T09:00:00",
      read: true,
      actionUrl: "/worksheets/ws-001",
    },
    {
      id: "notif-003",
      type: "message",
      title: "New Message",
      message: "Dr. Michael Chen sent you a message",
      dateTime: "2025-05-15T14:30:00",
      read: false,
      actionUrl: "/messages/dr-chen",
    },
    {
      id: "notif-004",
      type: "system",
      title: "Account Update",
      message: "Your profile information was updated successfully",
      dateTime: "2025-05-14T11:20:00",
      read: true,
    },
  ],
  recentCommunications: [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      status: "online",
      lastMessage: "How did the breathing exercises work for you?",
      time: "2025-05-16T14:30:00",
      unread: 2,
      avatar: "/therapist1.jpg",
    },
    {
      id: "2", 
      name: "Dr. Michael Chen",
      status: "offline",
      lastMessage: "I've uploaded your new worksheet. Please review it when you have time.",
      time: "2025-05-16T10:15:00",
      unread: 0,
      avatar: "/therapist2.jpg",
    },
    {
      id: "3",
      name: "Dr. Olivia Rodriguez",
      status: "away",
      lastMessage: "Looking forward to our family therapy session tomorrow!",
      time: "2025-05-15T16:45:00",
      unread: 1,
      avatar: "/therapist3.jpg",
    },
    {
      id: "support",
      name: "Support Team",
      status: "online",
      lastMessage: "Thanks for your feedback! We're always here to help.",
      time: "2025-05-14T09:30:00",
      unread: 0,
      avatar: "/support-avatar.jpg",
    },
  ],
};
