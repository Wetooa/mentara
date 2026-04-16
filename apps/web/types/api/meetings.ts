export interface Meeting {
  id: string;
  title?: string;
  description?: string;
  startTime: string;
  duration: number;
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  meetingType?: 'video' | 'audio' | 'chat';
  meetingUrl?: string;
  notes?: string;
  clientId: string;
  therapistId: string;
  actualStartTime?: string;
  actualEndTime?: string;
  client?: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
      email: string | null;
      profileImageUrl?: string | null;
    };
  };
  therapist?: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
      email: string | null;
      profileImageUrl?: string | null;
    };
  };
  durationConfig?: {
    id: string;
    name: string;
    duration: number;
    isActive: boolean;
    sortOrder: number;
  };
  session?: MeetingSession;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingSession {
  id: string;
  meetingId: string;
  startTime: string;
  endTime?: string;
  actualDuration?: number;
  participantCount: number;
  recordingUrl?: string;
  sessionNotes?: string;
  sessionType: 'video_call' | 'audio_call' | 'chat';
  createdAt: string;
  updatedAt: string;
}

export interface MeetingSessionData {
  meetingId: string;
  startTime: Date;
  endTime?: Date;
  participantCount: number;
  duration: number; // actual duration in minutes
  recordingUrl?: string;
  chatMessages?: ChatMessage[];
  techIssues?: string[];
  quality?: MeetingQuality;
}

export interface ChatMessage {
  senderId: string;
  senderRole: 'therapist' | 'client';
  message: string;
  timestamp: Date;
}

export interface MeetingQuality {
  videoQuality: 'poor' | 'fair' | 'good' | 'excellent';
  audioQuality: 'poor' | 'fair' | 'good' | 'excellent';
  connectionStability: 'poor' | 'fair' | 'good' | 'excellent';
}

export interface ParticipantInfo {
  userId: string;
  role: 'therapist' | 'client';
  mediaStatus: {
    video: boolean;
    audio: boolean;
    screen: boolean;
  };
  isReady: boolean;
  joinedAt: Date;
}

export interface MeetingRoomState {
  meetingId: string;
  participants: ParticipantInfo[];
  startTime: Date;
  status: 'waiting' | 'active' | 'ended';
  hostId?: string;
  chatMessages: ChatMessage[];
}

// WebSocket event types
export interface MeetingEvents {
  'meeting-joined': {
    meetingId: string;
    meeting: {
      id: string;
      title?: string;
      startTime: string;
      duration: number;
      status: 'waiting' | 'active' | 'ended';
    };
    participants: ParticipantInfo[];
    isHost: boolean;
  };
  
  'participant-joined': {
    participant: ParticipantInfo;
  };
  
  'participant-left': {
    userId: string;
  };
  
  'participant-media-changed': {
    userId: string;
    mediaType: 'video' | 'audio' | 'screen';
    enabled: boolean;
  };
  
  'participant-ready': {
    userId: string;
  };
  
  'meeting-started': {
    meetingId: string;
  };
  
  'meeting-ended': {
    meetingId: string;
    endTime: Date;
  };
  
  'chat-message': ChatMessage;
  
  'meeting-error': {
    error: string;
  };
  
  'webrtc-signal': {
    fromUserId: string;
    signal: any;
    type: 'offer' | 'answer' | 'ice-candidate';
  };
  
  'active-meetings': {
    meetings: Array<{
      id: string;
      title?: string;
      startTime: string;
      duration: number;
      status: string;
      isActive: boolean;
      participantCount: number;
    }>;
  };
  
  'recording-started': {
    meetingId: string;
  };
}

// Request/Response types for WebSocket
export interface JoinMeetingRequest {
  meetingId: string;
  mediaPreferences?: {
    video: boolean;
    audio: boolean;
  };
}

export interface MediaToggleRequest {
  meetingId: string;
  mediaType: 'video' | 'audio' | 'screen';
  enabled: boolean;
}

export interface ChatMessageRequest {
  meetingId: string;
  message: string;
  timestamp: Date;
}

export interface MeetingControlRequest {
  meetingId: string;
  action: 'start' | 'end' | 'pause' | 'record';
}

export interface WebRTCSignalRequest {
  meetingId: string;
  targetUserId: string;
  signal: any;
  type: 'offer' | 'answer' | 'ice-candidate';
}