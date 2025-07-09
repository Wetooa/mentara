// Sessions DTOs matching backend exactly

export interface SessionCreateDto {
  clientId: string;
  therapistId: string;
  meetingId?: string; // Link to booking meeting
  sessionNumber: number;
  plannedDuration: number; // minutes
  sessionType: 'initial' | 'regular' | 'followup' | 'final';
  notes?: string;
  goals?: string[];
}

export interface SessionUpdateDto {
  actualDuration?: number;
  sessionType?: 'initial' | 'regular' | 'followup' | 'final';
  notes?: string;
  goals?: string[];
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  outcomes?: string[];
  homework?: string[];
  nextSessionPlan?: string;
}

export interface Session {
  id: string;
  clientId: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
  therapistId: string;
  therapist: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
  meetingId?: string;
  meeting?: {
    id: string;
    startTime: string;
    duration: number;
    meetingUrl?: string;
  };
  sessionNumber: number;
  plannedDuration: number;
  actualDuration?: number;
  sessionType: 'initial' | 'regular' | 'followup' | 'final';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  goals?: string[];
  outcomes?: string[];
  homework?: string[];
  nextSessionPlan?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface SessionListParams {
  clientId?: string;
  therapistId?: string;
  sessionType?: 'initial' | 'regular' | 'followup' | 'final';
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'sessionNumber' | 'createdAt' | 'completedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface SessionListResponse {
  sessions: Session[];
  total: number;
  hasMore: boolean;
}

export interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  noShowSessions: number;
  averageDuration: number;
  totalDuration: number;
}