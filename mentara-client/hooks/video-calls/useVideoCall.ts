"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Peer from 'simple-peer';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthToken } from '@/lib/constants/auth';
import { 
  connectWebSocket, 
  disconnectWebSocket, 
  emitEvent, 
  emitEventWithResponse,
  onEvent, 
  getConnectionState 
} from '@/lib/websocket';
import type {
  CallState,
  MediaDeviceState,
  UseVideoCallReturn,
  IncomingVideoCallData,
  VideoCallOfferData,
  VideoCallAnswerData,
  VideoCallIceCandidateData,
  VideoCallEndData,
  StartWebRTCConnectionData,
  CallErrorData,
  VideoCallUser
} from '@/types/api/video-calls';

interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

const DEFAULT_WEBRTC_CONFIG: WebRTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Add TURN server if available
    // { 
    //   urls: 'turn:your-turn-server.com:3478',
    //   username: 'username',
    //   credential: 'password'
    // }
  ]
};

export function useVideoCall(): UseVideoCallReturn {
  const { user, isAuthenticated } = useAuth();
  
  // Call state
  const [callState, setCallState] = useState<CallState>({
    status: 'idle',
    currentCallId: null,
    isInitiator: false,
    remotePeerId: null,
    remoteUserInfo: null,
    error: null,
  });

  // Media state
  const [mediaState, setMediaState] = useState<MediaDeviceState>({
    videoEnabled: false,
    audioEnabled: false,
    localStream: null,
    remoteStream: null,
    availableDevices: {
      videoInputs: [],
      audioInputs: [],
      audioOutputs: [],
    },
    selectedDevices: {
      videoInput: null,
      audioInput: null,
      audioOutput: null,
    },
  });

  // Refs for peer connection and streams
  const peerRef = useRef<Peer.Instance | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (isAuthenticated) {
      const token = getAuthToken();
      if (token) {
        connectWebSocket(token);
      }
    }

    return () => {
      // Cleanup on unmount
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isAuthenticated]);

  // Set up WebSocket event listeners
  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];

    // Handle incoming video call
    const handleIncomingCall = (data: IncomingVideoCallData) => {
      setCallState(prev => ({
        ...prev,
        status: 'receiving',
        currentCallId: data.callId,
        remotePeerId: data.callerId,
        remoteUserInfo: data.callerInfo,
        isInitiator: false,
        error: null,
      }));
    };

    // Handle call accepted
    const handleCallAccepted = (data: { callId: string; timestamp: string }) => {
      console.log('✅ [useVideoCall] handleCallAccepted called:', {
        receivedCallId: data.callId,
        currentCallId: callState.currentCallId,
        match: data.callId === callState.currentCallId,
        currentStatus: callState.status
      });
      
      if (data.callId === callState.currentCallId) {
        console.log('✅ [useVideoCall] Call was accepted - updating status to calling');
        setCallState(prev => ({
          ...prev,
          status: 'calling',
        }));
      } else {
        console.warn('⚠️ [useVideoCall] Call ID mismatch in handleCallAccepted', {
          received: data.callId,
          current: callState.currentCallId
        });
      }
    };

    // Handle call declined
    const handleCallDeclined = (data: { callId: string; timestamp: string }) => {
      if (data.callId === callState.currentCallId) {
        resetCallState();
      }
    };

    // Handle WebRTC connection start
    const handleStartWebRTC = (data: StartWebRTCConnectionData) => {
      console.log('🚀 [useVideoCall] handleStartWebRTC called:', {
        receivedCallId: data.callId,
        currentCallId: callState.currentCallId,
        isInitiator: data.isInitiator,
        match: data.callId === callState.currentCallId,
        currentStatus: callState.status
      });
      
      if (data.callId === callState.currentCallId) {
        console.log('✅ [useVideoCall] Starting WebRTC connection');
        setCallState(prev => ({
          ...prev,
          status: 'in_call',
          isInitiator: data.isInitiator,
        }));
        initializePeerConnection(data.isInitiator);
      } else {
        console.warn('⚠️ [useVideoCall] Call ID mismatch in handleStartWebRTC', {
          received: data.callId,
          current: callState.currentCallId
        });
      }
    };

    // Handle WebRTC offer
    const handleWebRTCOffer = (data: VideoCallOfferData) => {
      if (data.callId === callState.currentCallId && peerRef.current) {
        peerRef.current.signal(data.signal);
      }
    };

    // Handle WebRTC answer
    const handleWebRTCAnswer = (data: VideoCallAnswerData) => {
      if (data.callId === callState.currentCallId && peerRef.current) {
        peerRef.current.signal(data.signal);
      }
    };

    // Handle ICE candidate
    const handleIceCandidate = (data: VideoCallIceCandidateData) => {
      if (data.callId === callState.currentCallId && peerRef.current) {
        peerRef.current.signal(data.candidate);
      }
    };

    // Handle call ended
    const handleCallEnded = (data: VideoCallEndData) => {
      if (data.callId === callState.currentCallId) {
        resetCallState();
        if (peerRef.current) {
          peerRef.current.destroy();
          peerRef.current = null;
        }
      }
    };

    // Handle call error
    const handleCallError = (data: CallErrorData) => {
      setCallState(prev => ({
        ...prev,
        error: data.error,
      }));
    };

    // Register event listeners
    cleanupFunctions.push(
      onEvent('incoming_video_call', handleIncomingCall),
      onEvent('video_call_accepted', handleCallAccepted),
      onEvent('video_call_declined', handleCallDeclined),
      onEvent('start_webrtc_connection', handleStartWebRTC),
      onEvent('video_call_offer', handleWebRTCOffer),
      onEvent('video_call_answer', handleWebRTCAnswer),
      onEvent('video_call_ice_candidate', handleIceCandidate),
      onEvent('video_call_ended', handleCallEnded),
      onEvent('call_error', handleCallError)
    );

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [callState.currentCallId]);

  // Reset call state
  const resetCallState = useCallback(() => {
    setCallState({
      status: 'idle',
      currentCallId: null,
      isInitiator: false,
      remotePeerId: null,
      remoteUserInfo: null,
      error: null,
    });

    setMediaState(prev => ({
      ...prev,
      remoteStream: null,
    }));

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach(track => track.stop());
      remoteStreamRef.current = null;
    }
  }, []);

  // Initialize peer connection
  const initializePeerConnection = useCallback(async (isInitiator: boolean) => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      setMediaState(prev => ({
        ...prev,
        localStream: stream,
        videoEnabled: true,
        audioEnabled: true,
      }));

      // Create peer connection
      const peer = new Peer({
        initiator: isInitiator,
        trickle: true,
        stream: stream,
        config: DEFAULT_WEBRTC_CONFIG,
      });

      peerRef.current = peer;

      // Handle peer events
      peer.on('signal', (data) => {
        if (!callState.currentCallId || !callState.remotePeerId) return;

        if (isInitiator) {
          // Send offer
          emitEvent('video_call_offer', {
            callId: callState.currentCallId,
            fromUserId: user?.id,
            toUserId: callState.remotePeerId,
            signal: data,
          });
        } else {
          // Send answer
          emitEvent('video_call_answer_signal', {
            callId: callState.currentCallId,
            fromUserId: user?.id,
            toUserId: callState.remotePeerId,
            signal: data,
          });
        }
      });

      peer.on('stream', (remoteStream) => {
        remoteStreamRef.current = remoteStream;
        setMediaState(prev => ({
          ...prev,
          remoteStream,
        }));
      });

      peer.on('connect', () => {
        console.log('Peer connection established');
      });

      peer.on('error', (err) => {
        console.error('Peer connection error:', err);
        setCallState(prev => ({
          ...prev,
          error: 'Connection failed',
        }));
      });

      peer.on('close', () => {
        resetCallState();
      });

    } catch (error) {
      console.error('Failed to initialize peer connection:', error);
      setCallState(prev => ({
        ...prev,
        error: 'Failed to access camera/microphone',
      }));
    }
  }, [callState.currentCallId, callState.remotePeerId, user?.id, resetCallState]);

  // Create a ref to track current call state to avoid dependency issues
  const callStateRef = useRef(callState);
  callStateRef.current = callState;

  // Initiate call
  const initiateCall = useCallback(async (recipientId: string) => {
    if (!isAuthenticated || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    if (callStateRef.current.status !== 'idle') {
      return { success: false, error: 'Already in a call' };
    }

    try {
      setCallState(prev => ({
        ...prev,
        status: 'calling',
        remotePeerId: recipientId,
      }));

      const response = await emitEventWithResponse('initiate_video_call', { recipientId });
      
      if (response.success) {
        setCallState(prev => ({
          ...prev,
          currentCallId: response.callId,
          isInitiator: true,
        }));
        return { success: true };
      } else {
        resetCallState();
        return { success: false, error: response.error || 'Failed to initiate call' };
      }
    } catch (error) {
      console.error('❌ [useVideoCall] initiateCall failed:', error);
      console.error('❌ [useVideoCall] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        recipientId,
        userAuthenticated: isAuthenticated,
        userId: user?.id,
        callState: callStateRef.current,
        wsConnected: getConnectionState(),
      });
      resetCallState();
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      return { success: false, error: `Call initiation failed: ${errorMessage}` };
    }
  }, [isAuthenticated, user, resetCallState]);

  // Accept call
  const acceptCall = useCallback((callId: string) => {
    console.log('📞 [useVideoCall] acceptCall called:', {
      providedCallId: callId,
      currentCallId: callStateRef.current.currentCallId,
      currentStatus: callStateRef.current.status,
      remotePeerId: callStateRef.current.remotePeerId,
      match: callStateRef.current.currentCallId === callId
    });
    
    if (callStateRef.current.currentCallId === callId) {
      console.log('✅ [useVideoCall] Accepting call - emitting video_call_answer');
      emitEvent('video_call_answer', { callId, accept: true });
    } else {
      console.warn('⚠️ [useVideoCall] Call ID mismatch - cannot accept', {
        provided: callId,
        current: callStateRef.current.currentCallId
      });
      
      // If we don't have a current call but received a callId, set it up
      if (!callStateRef.current.currentCallId && callId) {
        console.log('🔧 [useVideoCall] Setting up call state for acceptance');
        setCallState(prev => ({
          ...prev,
          currentCallId: callId,
          status: 'receiving',
        }));
        
        // Accept after state is set
        setTimeout(() => {
          console.log('✅ [useVideoCall] Accepting call after state setup');
          emitEvent('video_call_answer', { callId, accept: true });
        }, 100);
      }
    }
  }, []);

  // Decline call
  const declineCall = useCallback((callId: string) => {
    if (callStateRef.current.currentCallId === callId) {
      emitEvent('video_call_answer', { callId, accept: false });
      resetCallState();
    }
  }, [resetCallState]);

  // End call
  const endCall = useCallback(() => {
    if (callStateRef.current.currentCallId) {
      emitEvent('video_call_end', { callId: callStateRef.current.currentCallId });
      resetCallState();
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    }
  }, [resetCallState]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setMediaState(prev => ({
          ...prev,
          videoEnabled: videoTrack.enabled,
        }));
      }
    }
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMediaState(prev => ({
          ...prev,
          audioEnabled: audioTrack.enabled,
        }));
      }
    }
  }, []);

  // Switch camera (front/back on mobile)
  const switchCamera = useCallback(async () => {
    // This is a simplified implementation
    // In a real app, you'd want to enumerate devices and switch between them
    console.log('Camera switching not implemented yet');
  }, []);

  // Device management functions (simplified)
  const setVideoDevice = useCallback((deviceId: string) => {
    console.log('Video device switching not implemented yet');
  }, []);

  const setAudioDevice = useCallback((deviceId: string) => {
    console.log('Audio device switching not implemented yet');
  }, []);

  const refreshDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setMediaState(prev => ({
        ...prev,
        availableDevices: {
          videoInputs: devices.filter(d => d.kind === 'videoinput'),
          audioInputs: devices.filter(d => d.kind === 'audioinput'),
          audioOutputs: devices.filter(d => d.kind === 'audiooutput'),
        },
      }));
    } catch (error) {
      console.error('Failed to enumerate devices:', error);
    }
  }, []);

  // Initialize device enumeration on mount
  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  return {
    callState,
    mediaState,
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
    toggleVideo,
    toggleAudio,
    switchCamera,
    setVideoDevice,
    setAudioDevice,
    refreshDevices,
  };
}