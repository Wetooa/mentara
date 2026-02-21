// Group Session Types for Community Feature

export type SessionType = "virtual" | "in-person" | "hybrid";

export type SessionFormat =
  | "group-therapy"
  | "workshop"
  | "support-circle"
  | "webinar"
  | "meditation"
  | "social";

export type SessionStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export type HostRole = "therapist" | "moderator";

export type RSVPStatus = "attending" | "waitlist" | "declined" | "none";

export interface SessionHost {
  id: string;
  name: string;
  role: HostRole;
  avatarUrl?: string;
  credentials?: string; // e.g., "Licensed Therapist, PhD"
  bio?: string;
}

export interface SessionParticipant {
  id: string;
  userId: string;
  sessionId: string;
  status: RSVPStatus;
  joinedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

export interface RecurrencePattern {
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  endDate?: string;
  daysOfWeek?: number[]; // 0-6, Sunday-Saturday
}

export interface GroupSession {
  id: string;
  title: string;
  description: string;
  type: SessionType;
  format: SessionFormat;

  // Scheduling
  startTime: string;
  endTime: string;
  timezone: string;
  duration: number; // in minutes

  // Capacity
  maxParticipants: number;
  currentParticipants: number;
  waitlistCount: number;

  // Location
  location?: string; // For in-person/hybrid
  meetingLink?: string; // For virtual/hybrid
  meetingPassword?: string;

  // Host info
  host: SessionHost;
  coHosts?: SessionHost[];

  // Community context
  communityId: string;
  communityName?: string;
  roomId?: string; // Optional: tie to specific room
  roomName?: string;

  // Status & metadata
  status: SessionStatus;
  tags: string[];
  requiresApproval: boolean;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;

  // Participants
  participants: SessionParticipant[];
  waitlist: SessionParticipant[];

  // Additional info
  materials?: string[]; // URLs to resources
  recordingUrl?: string; // For completed sessions
  notes?: string; // Post-session notes

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // User interaction
  userRSVP?: RSVPStatus; // Current user's RSVP status
}

export interface CreateSessionRequest {
  title: string;
  description: string;
  type: SessionType;
  format: SessionFormat;
  startTime: string;
  endTime: string;
  timezone: string;
  maxParticipants: number;
  location?: string;
  meetingLink?: string;
  meetingPassword?: string;
  communityId: string;
  roomId?: string;
  tags: string[];
  requiresApproval: boolean;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
}

export interface UpdateSessionRequest extends Partial<CreateSessionRequest> {
  id: string;
  status?: SessionStatus;
}

export interface SessionFilters {
  communityId?: string;
  roomId?: string;
  status?: SessionStatus[];
  type?: SessionType[];
  format?: SessionFormat[];
  hostId?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  onlyUserSessions?: boolean; // Only sessions user is attending
}

export interface SessionsListResponse {
  sessions: GroupSession[];
  total: number;
  upcoming: number;
  ongoing: number;
  completed: number;
}

export interface RSVPRequest {
  sessionId: string;
  status: "join" | "leave";
}

export interface SessionStats {
  totalSessions: number;
  upcomingSessions: number;
  completedSessions: number;
  totalParticipants: number;
  averageAttendance: number;
}
