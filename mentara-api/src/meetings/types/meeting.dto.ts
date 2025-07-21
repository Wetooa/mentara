/**
 * Meetings Module DTOs - Data Transfer Objects for meeting operations
 * These are pure TypeScript interfaces without validation logic
 */

// Video room creation DTO
export interface CreateVideoRoomDto {
  meetingId: string;
  participantIds: string[];
  roomType?: 'consultation' | 'therapy' | 'group' | 'emergency';
  maxParticipants?: number;
  recordingEnabled?: boolean;
  screenShareEnabled?: boolean;
  chatEnabled?: boolean;
  waitingRoomEnabled?: boolean;
  metadata?: {
    title?: string;
    description?: string;
    scheduledStartTime?: string;
    estimatedDuration?: number; // in minutes
  };
}

// Video room join DTO
export interface JoinVideoRoomDto {
  roomId: string;
  userType: 'host' | 'participant' | 'observer';
  displayName?: string;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
  metadata?: {
    deviceInfo?: string;
    browserInfo?: string;
    connectionQuality?: string;
  };
}

// End video call DTO
export interface EndVideoCallDto {
  roomId: string;
  reason?: 'completed' | 'cancelled' | 'technical_issue' | 'emergency';
  duration?: number; // in seconds
  participantFeedback?: {
    audioQuality?: number; // 1-5 rating
    videoQuality?: number; // 1-5 rating
    overallExperience?: number; // 1-5 rating
    issues?: string[];
  };
}

// Meeting status update DTO
export interface UpdateMeetingStatusDto {
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled' | 'missed' | 'rescheduled';
  reason?: string;
  rescheduledTo?: string; // ISO datetime string
  notes?: string;
  actualStartTime?: string;
  actualEndTime?: string;
}

// Save meeting session DTO
export interface SaveMeetingSessionDto {
  meetingId: string;
  duration: number; // in seconds
  recordingUrl?: string;
  transcriptUrl?: string;
  participantData: {
    userId: string;
    joinTime: string;
    leaveTime?: string;
    participationScore?: number; // 0-100
    speakingTime?: number; // in seconds
  }[];
  sessionSummary?: {
    keyTopics?: string[];
    actionItems?: string[];
    nextSteps?: string[];
    therapistNotes?: string;
    clientProgress?: string;
  };
  technicalMetrics?: {
    averageAudioQuality?: number;
    averageVideoQuality?: number;
    connectionIssues?: number;
    reconnections?: number;
  };
  // Additional properties used by service
  sessionData?: {
    duration?: number;
    quality?: number;
    issues?: string[];
    startedAt?: string;
    endedAt?: string;
  };
  sessionNotes?: string;
  clientProgress?: string;
  followUpActions?: string[];
}

// Meeting response DTOs
export interface VideoRoomResponse {
  roomId: string;
  meetingId: string;
  status: 'created' | 'active' | 'ended';
  joinUrl: string;
  hostJoinUrl?: string;
  participants: {
    userId: string;
    userType: 'host' | 'participant' | 'observer';
    status: 'invited' | 'joined' | 'left';
    joinTime?: string;
    leaveTime?: string;
  }[];
  roomSettings: {
    maxParticipants: number;
    recordingEnabled: boolean;
    screenShareEnabled: boolean;
    chatEnabled: boolean;
    waitingRoomEnabled: boolean;
  };
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
}

export interface VideoCallStatus {
  roomId: string;
  isActive: boolean;
  participantCount: number;
  duration?: number; // in seconds
  status: 'waiting' | 'in_progress' | 'ended';
  participants: {
    userId: string;
    displayName?: string;
    isHost: boolean;
    audioEnabled: boolean;
    videoEnabled: boolean;
    connectionStatus: 'connected' | 'connecting' | 'disconnected';
  }[];
  technicalInfo?: {
    averageLatency?: number;
    averageBitrate?: number;
    qualityMetrics?: {
      audio: number; // 1-5 rating
      video: number; // 1-5 rating
    };
  };
}

export interface MeetingResponseDto {
  id: string;
  title: string;
  description?: string;
  type: 'consultation' | 'therapy' | 'group' | 'emergency' | 'follow_up';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled' | 'missed' | 'rescheduled';
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  duration?: number; // in minutes
  clientId: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  therapistId: string;
  therapist: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      avatarUrl?: string;
    };
  };
  roomId?: string;
  recordingUrl?: string;
  transcriptUrl?: string;
  notes?: string;
  sessionSummary?: {
    keyTopics?: string[];
    actionItems?: string[];
    nextSteps?: string[];
    therapistNotes?: string;
    clientProgress?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Meeting query DTOs
export interface MeetingQueryDto {
  clientId?: string;
  therapistId?: string;
  status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled' | 'missed' | 'rescheduled';
  type?: 'consultation' | 'therapy' | 'group' | 'emergency' | 'follow_up';
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'date' | 'status' | 'type';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}