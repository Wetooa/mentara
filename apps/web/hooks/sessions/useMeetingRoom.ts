import { useEffect, useState, useRef, useCallback } from 'react';
import { useApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { createSocket } from '@/lib/websocket';
import { toast } from 'sonner';
import { WebRTCService } from '@/lib/webrtc/webrtc-service';

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
  const { user } = useAuth();
  const meetingSocketRef = useRef<any>(null);
  const webrtcServiceRef = useRef<WebRTCService | null>(null);

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

    meetingSocket.on('meeting-joined', async (data: {
      meetingId: string;
      meeting: MeetingInfo;
      participants: ParticipantInfo[];
      isHost: boolean;
    }) => {
      setMeetingInfo(data.meeting);
      setParticipants(data.participants);
      setIsHost(data.isHost);
      
      // Initialize WebRTC service for meeting room
      if (!webrtcServiceRef.current) {
        webrtcServiceRef.current = new WebRTCService({
          onSignalData: (userId: string, signalData: any) => {
            // Send WebRTC signal through meeting gateway
            if (meetingSocketRef.current) {
              meetingSocketRef.current.emit('webrtc-signal', {
                meetingId,
                targetUserId: userId,
                signal: signalData,
                type: signalData.type || 'offer',
              });
            }
          },
          onPeerConnected: (userId: string, stream: MediaStream) => {
            toast.success(`Connected to ${userId}`);
          },
          onPeerDisconnected: (userId: string) => {
            toast.info(`Disconnected from ${userId}`);
          },
          onError: (userId: string, error: Error) => {
            toast.error(`WebRTC error with ${userId}: ${error.message}`);
          },
        });
        webrtcServiceRef.current.setMeetingId(meetingId);
      }

      // Create peer connections for existing participants
      const otherParticipantIds = data.participants
        .map(p => p.userId)
        .filter(id => id !== user?.id);
      
      if (otherParticipantIds.length > 0 && webrtcServiceRef.current) {
        await webrtcServiceRef.current.createMeetingRoomConnections(
          otherParticipantIds,
          data.isHost
        );
      }

      toast.success('Joined meeting successfully');
    });

    meetingSocket.on('participant-joined', async (data: { participant: ParticipantInfo }) => {
      setParticipants(prev => [...prev, data.participant]);
      
      // Create peer connection for new participant
      if (webrtcServiceRef.current && user?.id) {
        const isInitiator = isHost;
        await webrtcServiceRef.current.createPeerConnection(
          data.participant.userId,
          isInitiator
        );
      }
      
      toast.info(`${data.participant.role} joined the meeting`);
    });

    meetingSocket.on('participant-left', (data: { userId: string }) => {
      setParticipants(prev => prev.filter(p => p.userId !== data.userId));
      
      // Destroy peer connection for left participant
      if (webrtcServiceRef.current) {
        webrtcServiceRef.current.destroyPeerConnection(data.userId);
      }
      
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

    // WebRTC signaling handlers
    meetingSocket.on('webrtc-signal', (data: {
      meetingId: string;
      fromUserId: string;
      signal: any;
      type: 'offer' | 'answer' | 'ice-candidate';
    }) => {
      if (webrtcServiceRef.current) {
        webrtcServiceRef.current.handleSignal(data.fromUserId, data.signal);
      }
    });

    meetingSocket.on('webrtc-offer', (data: {
      meetingId: string;
      fromUserId: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      if (webrtcServiceRef.current) {
        webrtcServiceRef.current.handleSignal(data.fromUserId, data.offer);
      }
    });

    meetingSocket.on('webrtc-answer', (data: {
      meetingId: string;
      fromUserId: string;
      answer: RTCSessionDescriptionInit;
    }) => {
      if (webrtcServiceRef.current) {
        webrtcServiceRef.current.handleSignal(data.fromUserId, data.answer);
      }
    });

    meetingSocket.on('webrtc-ice-candidate', (data: {
      meetingId: string;
      fromUserId: string;
      candidate: RTCIceCandidateInit;
    }) => {
      if (webrtcServiceRef.current) {
        webrtcServiceRef.current.handleSignal(data.fromUserId, data.candidate);
      }
    });

    meetingSocket.on('webrtc-error', (data: { error: string }) => {
      toast.error(`WebRTC error: ${data.error}`);
      onError?.(data.error);
    });

    return () => {
      if (meetingSocket && meetingSocket.connected) {
        meetingSocket.disconnect();
      }
      meetingSocketRef.current = null;
      
      // Cleanup WebRTC service
      if (webrtcServiceRef.current) {
        webrtcServiceRef.current.destroy();
        webrtcServiceRef.current = null;
      }
    };
  }, [meetingId, onMeetingEnd, onError, user?.id, isHost]);

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
  const sendWebRTCSignal = useCallback((targetUserId: string | undefined, signal: any, type: 'offer' | 'answer' | 'ice-candidate') => {
    if (!meetingSocketRef.current) return;

    if (targetUserId) {
      // Send to specific user
      meetingSocketRef.current.emit('webrtc-signal', {
        meetingId,
        targetUserId,
        signal,
        type,
      });
    } else {
      // Broadcast to all participants
      meetingSocketRef.current.emit('webrtc-signal', {
        meetingId,
        signal,
        type,
      });
    }
  }, [meetingId]);

  // Get WebRTC service instance
  const getWebRTCService = useCallback(() => {
    return webrtcServiceRef.current;
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
    getWebRTCService,
    getMeetingRoomUrl,

    // Derived state
    participantCount: participants.length,
    isActive: meetingInfo?.status === 'active',
    isWaiting: meetingInfo?.status === 'waiting',
    isEnded: meetingInfo?.status === 'ended',
    allParticipantsReady: participants.every(p => p.isReady),
  };
}