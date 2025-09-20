import { useEffect, useState, useRef, useCallback } from 'react';
import { useApi } from '@/lib/api';
import { createSocket } from '@/lib/websocket';
import { toast } from 'sonner';

interface ParticipantInfo {
  userId: string;
  role: 'therapist' | 'client';
  mediaStatus: {
    video: boolean;
    audio: boolean;
    screen: boolean;
  };
  isReady: boolean;
}

interface MeetingInfo {
  id: string;
  title?: string;
  startTime: string;
  duration: number;
  status: 'waiting' | 'active' | 'ended';
}

interface ChatMessage {
  senderId: string;
  senderRole: 'therapist' | 'client';
  message: string;
  timestamp: Date;
}

interface UseMeetingRoomProps {
  meetingId: string;
  onMeetingEnd?: () => void;
  onError?: (error: string) => void;
}

export function useMeetingRoom({ meetingId, onMeetingEnd, onError }: UseMeetingRoomProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [meetingInfo, setMeetingInfo] = useState<MeetingInfo | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [localMediaStatus, setLocalMediaStatus] = useState({
    video: false,
    audio: true,
    screen: false,
  });

  const api = useApi();
  const meetingSocketRef = useRef<any>(null);

  // Initialize meeting WebSocket connection
  useEffect(() => {
    if (!meetingId) return;

    const meetingSocket = createSocket('/meetings');
    meetingSocketRef.current = meetingSocket;

    meetingSocket.on('connect', () => {
      setIsConnected(true);
    });

    meetingSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    meetingSocket.on('meeting-joined', (data: {
      meetingId: string;
      meeting: MeetingInfo;
      participants: ParticipantInfo[];
      isHost: boolean;
    }) => {
      setMeetingInfo(data.meeting);
      setParticipants(data.participants);
      setIsHost(data.isHost);
      toast.success('Joined meeting successfully');
    });

    meetingSocket.on('participant-joined', (data: { participant: ParticipantInfo }) => {
      setParticipants(prev => [...prev, data.participant]);
      toast.info(`${data.participant.role} joined the meeting`);
    });

    meetingSocket.on('participant-left', (data: { userId: string }) => {
      setParticipants(prev => prev.filter(p => p.userId !== data.userId));
      toast.info('Participant left the meeting');
    });

    meetingSocket.on('participant-media-changed', (data: {
      userId: string;
      mediaType: 'video' | 'audio' | 'screen';
      enabled: boolean;
    }) => {
      setParticipants(prev => prev.map(p => 
        p.userId === data.userId 
          ? { ...p, mediaStatus: { ...p.mediaStatus, [data.mediaType]: data.enabled } }
          : p
      ));
    });

    meetingSocket.on('participant-ready', (data: { userId: string }) => {
      setParticipants(prev => prev.map(p =>
        p.userId === data.userId ? { ...p, isReady: true } : p
      ));
    });

    meetingSocket.on('meeting-started', () => {
      setMeetingInfo(prev => prev ? { ...prev, status: 'active' } : null);
      toast.success('Meeting started!');
    });

    meetingSocket.on('meeting-ended', (data: { meetingId: string; endTime: Date }) => {
      setMeetingInfo(prev => prev ? { ...prev, status: 'ended' } : null);
      toast.info('Meeting ended');
      onMeetingEnd?.();
    });

    meetingSocket.on('chat-message', (data: ChatMessage) => {
      setChatMessages(prev => [...prev, data]);
    });

    meetingSocket.on('meeting-error', (data: { error: string }) => {
      toast.error(data.error);
      onError?.(data.error);
    });

    meetingSocket.on('webrtc-signal', (data: {
      fromUserId: string;
      signal: any;
      type: 'offer' | 'answer' | 'ice-candidate';
    }) => {
      // Handle WebRTC signaling for video/audio
      handleWebRTCSignal(data);
    });

    return () => {
      if (meetingSocket && meetingSocket.connected) {
        meetingSocket.disconnect();
      }
      meetingSocketRef.current = null;
    };
  }, [meetingId, onMeetingEnd, onError]);

  // Join meeting room
  const joinMeeting = useCallback((mediaPreferences?: { video: boolean; audio: boolean }) => {
    if (!meetingSocketRef.current) return;

    meetingSocketRef.current.emit('join-meeting', {
      meetingId,
      mediaPreferences,
    });

    if (mediaPreferences) {
      setLocalMediaStatus(prev => ({ ...prev, ...mediaPreferences }));
    }
  }, [meetingId]);

  // Leave meeting room
  const leaveMeeting = useCallback(() => {
    if (!meetingSocketRef.current) return;

    meetingSocketRef.current.emit('leave-meeting', { meetingId });
  }, [meetingId]);

  // Toggle media (video/audio/screen)
  const toggleMedia = useCallback((mediaType: 'video' | 'audio' | 'screen', enabled?: boolean) => {
    if (!meetingSocketRef.current) return;

    const newEnabled = enabled ?? !localMediaStatus[mediaType];
    
    meetingSocketRef.current.emit('toggle-media', {
      meetingId,
      mediaType,
      enabled: newEnabled,
    });

    setLocalMediaStatus(prev => ({ ...prev, [mediaType]: newEnabled }));
  }, [meetingId, localMediaStatus]);

  // Mark participant as ready
  const markReady = useCallback(() => {
    if (!meetingSocketRef.current) return;

    meetingSocketRef.current.emit('participant-ready', { meetingId });
  }, [meetingId]);

  // Send chat message
  const sendChatMessage = useCallback((message: string) => {
    if (!meetingSocketRef.current || !message.trim()) return;

    meetingSocketRef.current.emit('chat-message', {
      meetingId,
      message,
      timestamp: new Date(),
    });
  }, [meetingId]);

  // Meeting controls (host only)
  const startMeeting = useCallback(() => {
    if (!meetingSocketRef.current || !isHost) return;

    meetingSocketRef.current.emit('meeting-control', {
      meetingId,
      action: 'start',
    });
  }, [meetingId, isHost]);

  const endMeeting = useCallback(() => {
    if (!meetingSocketRef.current || !isHost) return;

    meetingSocketRef.current.emit('meeting-control', {
      meetingId,
      action: 'end',
    });
  }, [meetingId, isHost]);

  const startRecording = useCallback(() => {
    if (!meetingSocketRef.current || !isHost) return;

    meetingSocketRef.current.emit('meeting-control', {
      meetingId,
      action: 'record',
    });
  }, [meetingId, isHost]);

  // WebRTC signaling
  const sendWebRTCSignal = useCallback((targetUserId: string, signal: any, type: 'offer' | 'answer' | 'ice-candidate') => {
    if (!meetingSocketRef.current) return;

    meetingSocketRef.current.emit('webrtc-signal', {
      meetingId,
      targetUserId,
      signal,
      type,
    });
  }, [meetingId]);

  const handleWebRTCSignal = useCallback((data: {
    fromUserId: string;
    signal: any;
    type: 'offer' | 'answer' | 'ice-candidate';
  }) => {
    // This would be handled by WebRTC implementation
    // WebRTC signal processing logic would go here
  }, []);

  // Get meeting room URL
  const getMeetingRoomUrl = useCallback(async () => {
    try {
      const response = await api.meetings.generateMeetingRoom(meetingId);
      return response.roomUrl;
    } catch (error) {
      toast.error('Failed to get meeting room URL');
      throw error;
    }
  }, [meetingId, api]);

  return {
    // Connection state
    isConnected,
    meetingInfo,
    participants,
    chatMessages,
    isHost,
    localMediaStatus,

    // Actions
    joinMeeting,
    leaveMeeting,
    toggleMedia,
    markReady,
    sendChatMessage,
    
    // Host controls
    startMeeting,
    endMeeting,
    startRecording,
    
    // WebRTC
    sendWebRTCSignal,
    getMeetingRoomUrl,

    // Derived state
    participantCount: participants.length,
    isActive: meetingInfo?.status === 'active',
    isWaiting: meetingInfo?.status === 'waiting',
    isEnded: meetingInfo?.status === 'ended',
    allParticipantsReady: participants.every(p => p.isReady),
  };
}