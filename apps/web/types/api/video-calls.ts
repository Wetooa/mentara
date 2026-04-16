// Video Call Types for Frontend
// These interfaces define the structure of video call data on the client side

export interface VideoCallUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface VideoCallSession {
  id: string;
  callerId: string;
  recipientId: string;
  status: 'initiating' | 'ringing' | 'active' | 'ended';
  startTime: string; // ISO string
  endTime?: string; // ISO string
}

export interface IncomingVideoCallData {
  callId: string;
  callerId: string;
  callerName: string;
  callerInfo: VideoCallUser;
  timestamp: string; // ISO string
}

export interface VideoCallOfferData {
  callId: string;
  fromUserId: string;
  toUserId: string;
  signal: any; // Simple-peer signal data
  timestamp: string; // ISO string
}

export interface VideoCallAnswerData {
  callId: string;
  fromUserId: string;
  toUserId: string;
  signal: any; // Simple-peer signal data
  timestamp: string; // ISO string
}

export interface VideoCallIceCandidateData {
  callId: string;
  fromUserId: string;
  toUserId: string;
  candidate: any; // ICE candidate data
  timestamp: string; // ISO string
}

export interface VideoCallEndData {
  callId: string;
  reason: 'ended' | 'declined' | 'timeout' | 'error';
  timestamp: string; // ISO string
}

export interface StartWebRTCConnectionData {
  callId: string;
  isInitiator: boolean;
  timestamp: string; // ISO string
}

export interface CallErrorData {
  error: string;
  callId?: string;
  timestamp?: string; // ISO string
}

// WebSocket Event Types
export type VideoCallWebSocketEvents = {
  // Outgoing events (client to server)
  initiate_video_call: { recipientId: string };
  video_call_answer: { callId: string; accept: boolean };
  video_call_decline: { callId: string };
  video_call_offer: VideoCallOfferData;
  video_call_answer_signal: VideoCallAnswerData;
  video_call_ice_candidate: VideoCallIceCandidateData;
  video_call_end: { callId: string };

  // Incoming events (server to client)
  incoming_video_call: IncomingVideoCallData;
  video_call_accepted: { callId: string; timestamp: string };
  video_call_declined: { callId: string; timestamp: string };
  start_webrtc_connection: StartWebRTCConnectionData;
  video_call_ended: VideoCallEndData;
  call_error: CallErrorData;
};

// Call State Types
export type CallStatus = 'idle' | 'calling' | 'receiving' | 'in_call';

export interface CallState {
  status: CallStatus;
  currentCallId: string | null;
  isInitiator: boolean;
  remotePeerId: string | null;
  remoteUserInfo: VideoCallUser | null;
  error: string | null;
}

// Media Device Types
export interface MediaDeviceState {
  videoEnabled: boolean;
  audioEnabled: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  availableDevices: {
    videoInputs: MediaDeviceInfo[];
    audioInputs: MediaDeviceInfo[];
    audioOutputs: MediaDeviceInfo[];
  };
  selectedDevices: {
    videoInput: string | null;
    audioInput: string | null;
    audioOutput: string | null;
  };
}

// Hook Return Types
export interface UseVideoCallReturn {
  callState: CallState;
  mediaState: MediaDeviceState;
  
  // Call control functions
  initiateCall: (recipientId: string) => Promise<{ success: boolean; error?: string }>;
  acceptCall: (callId: string) => void;
  declineCall: (callId: string) => void;
  endCall: () => void;
  
  // Media control functions
  toggleVideo: () => void;
  toggleAudio: () => void;
  switchCamera: () => void;
  
  // Device management
  setVideoDevice: (deviceId: string) => void;
  setAudioDevice: (deviceId: string) => void;
  refreshDevices: () => void;
}

export interface UseCallNotificationsReturn {
  incomingCall: IncomingVideoCallData | null;
  showIncomingCallNotification: boolean;
  acceptIncomingCall: () => void;
  declineIncomingCall: () => void;
  dismissNotification: () => void;
}

export interface UseMediaDevicesReturn {
  mediaState: MediaDeviceState;
  requestPermissions: () => Promise<boolean>;
  toggleVideo: () => void;
  toggleAudio: () => void;
  switchCamera: () => void;
  setVideoDevice: (deviceId: string) => void;
  setAudioDevice: (deviceId: string) => void;
  refreshDevices: () => void;
  getDisplayMedia: () => Promise<MediaStream | null>;
}

// API Service Types
export interface VideoCallApiService {
  // These would be minimal since video calls are peer-to-peer
  // But might be useful for logging or analytics
  logCallStart: (callId: string, recipientId: string) => Promise<void>;
  logCallEnd: (callId: string, duration: number) => Promise<void>;
  reportCallQuality: (callId: string, quality: 'poor' | 'fair' | 'good' | 'excellent') => Promise<void>;
}

// Notification Integration Types
export interface VideoCallNotification {
  id: string;
  type: 'INCOMING_VIDEO_CALL' | 'VIDEO_CALL_MISSED' | 'VIDEO_CALL_ENDED';
  title: string;
  message: string;
  data: {
    callId: string;
    callerId?: string;
    callerName?: string;
    duration?: number;
    endReason?: string;
  };
  priority: 'urgent' | 'high' | 'normal' | 'low';
  timestamp: string;
  isRead: boolean;
}

// Component Props Types
export interface IncomingCallNotificationProps {
  incomingCall: IncomingVideoCallData;
  onAccept: () => void;
  onDecline: () => void;
  onTimeout?: () => void;
  timeoutDuration?: number; // in seconds, default 30
}

export interface VideoCallInterfaceProps {
  callId: string;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isInitiator: boolean;
  remoteUser: VideoCallUser;
  onEndCall: () => void;
}

export interface CallControlsProps {
  videoEnabled: boolean;
  audioEnabled: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onEndCall: () => void;
  onSwitchCamera?: () => void;
  showSwitchCamera?: boolean;
}