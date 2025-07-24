"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthToken } from '@/lib/constants/auth';
import { 
  connectWebSocket, 
  onEvent, 
  emitEvent,
  getConnectionState 
} from '@/lib/websocket';
import type {
  IncomingVideoCallData,
  UseCallNotificationsReturn
} from '@/types/api/video-calls';

export function useCallNotifications(): UseCallNotificationsReturn {
  const { isAuthenticated } = useAuth();
  const [incomingCall, setIncomingCall] = useState<IncomingVideoCallData | null>(null);
  const [showIncomingCallNotification, setShowIncomingCallNotification] = useState(false);
  
  // Timeout ref for auto-dismissing notifications
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Audio notification refs
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  // Initialize WebSocket connection if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const token = getAuthToken();
      if (token) {
        connectWebSocket(token);
      }
    }
  }, [isAuthenticated]);

  // Initialize ringtone audio (optional)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // You can add a ringtone audio file to public/sounds/
      // ringtoneRef.current = new Audio('/sounds/ringtone.mp3');
      // ringtoneRef.current.loop = true;
    }
    
    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current = null;
      }
    };
  }, []);

  // Clear any existing timeout
  const clearNotificationTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Stop ringtone
  const stopRingtone = useCallback(() => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
  }, []);

  // Play ringtone
  const playRingtone = useCallback(() => {
    if (ringtoneRef.current) {
      ringtoneRef.current.play().catch(error => {
        // Handle audio play error (usually due to browser autoplay policy)
        console.warn('Could not play ringtone:', error);
      });
    }
  }, []);

  // Handle incoming video call
  const handleIncomingCall = useCallback((data: IncomingVideoCallData) => {
    console.log('📞 [useCallNotifications] Received incoming video call:', data);
    console.log('📞 [useCallNotifications] Call details:', {
      callId: data.callId,
      callerId: data.callerId,
      callerName: data.callerName,
      timestamp: data.timestamp
    });
    
    setIncomingCall(data);
    setShowIncomingCallNotification(true);
    
    // Play ringtone
    playRingtone();
    
    // Auto-dismiss after 30 seconds
    clearNotificationTimeout();
    timeoutRef.current = setTimeout(() => {
      console.log('⏰ [useCallNotifications] Auto-declining call after timeout:', data.callId);
      // Auto-decline the call after timeout
      emitEvent('video_call_decline', { callId: data.callId });
      setIncomingCall(null);
      setShowIncomingCallNotification(false);
      stopRingtone();
    }, 30000); // 30 seconds timeout
  }, [playRingtone, clearNotificationTimeout, stopRingtone]);

  // Handle call declined (by us or the other party)
  const handleCallDeclined = useCallback((data: { callId: string; timestamp: string }) => {
    if (incomingCall && data.callId === incomingCall.callId) {
      setIncomingCall(null);
      setShowIncomingCallNotification(false);
      stopRingtone();
      clearNotificationTimeout();
    }
  }, [incomingCall, stopRingtone, clearNotificationTimeout]);

  // Handle call accepted (by us)
  const handleCallAccepted = useCallback((data: { callId: string; timestamp: string }) => {
    if (incomingCall && data.callId === incomingCall.callId) {
      setShowIncomingCallNotification(false);
      stopRingtone();
      clearNotificationTimeout();
      // Keep incomingCall data for potential use, but hide notification
    }
  }, [incomingCall, stopRingtone, clearNotificationTimeout]);

  // Handle call ended
  const handleCallEnded = useCallback((data: { callId: string; reason: string; timestamp: string }) => {
    if (incomingCall && data.callId === incomingCall.callId) {
      setIncomingCall(null);
      setShowIncomingCallNotification(false);
      stopRingtone();
      clearNotificationTimeout();
    }
  }, [incomingCall, stopRingtone, clearNotificationTimeout]);

  // Set up WebSocket event listeners
  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];

    if (isAuthenticated) {
      console.log('🔌 [useCallNotifications] Setting up WebSocket event listeners...');
      console.log('🔌 [useCallNotifications] WebSocket connection state:', getConnectionState());
      
      cleanupFunctions.push(
        onEvent('incoming_video_call', handleIncomingCall),
        onEvent('video_call_declined', handleCallDeclined),
        onEvent('video_call_accepted', handleCallAccepted),
        onEvent('video_call_ended', handleCallEnded)
      );
      
      console.log('✅ [useCallNotifications] Event listeners registered');
    } else {
      console.log('❌ [useCallNotifications] Not authenticated - skipping event listeners');
    }

    return () => {
      console.log('🧹 [useCallNotifications] Cleaning up event listeners');
      cleanupFunctions.forEach(cleanup => cleanup());
      clearNotificationTimeout();
      stopRingtone();
    };
  }, [
    isAuthenticated,
    handleIncomingCall,
    handleCallDeclined,
    handleCallAccepted,
    handleCallEnded,
    clearNotificationTimeout,
    stopRingtone
  ]);

  // Accept incoming call
  const acceptIncomingCall = useCallback(() => {
    if (incomingCall) {
      emitEvent('video_call_answer', { 
        callId: incomingCall.callId, 
        accept: true 
      });
      
      // Navigate to video call page
      const userRole = window.location.pathname.split('/')[1]; // Get role from URL
      const callPage = `/${userRole}/video-call?callId=${incomingCall.callId}`;
      window.location.href = callPage;
      
      // Clean up notification state
      setShowIncomingCallNotification(false);
      stopRingtone();
      clearNotificationTimeout();
    }
  }, [incomingCall, stopRingtone, clearNotificationTimeout]);

  // Decline incoming call
  const declineIncomingCall = useCallback(() => {
    if (incomingCall) {
      emitEvent('video_call_answer', { 
        callId: incomingCall.callId, 
        accept: false 
      });
      
      // Clean up notification state
      setIncomingCall(null);
      setShowIncomingCallNotification(false);
      stopRingtone();
      clearNotificationTimeout();
    }
  }, [incomingCall, stopRingtone, clearNotificationTimeout]);

  // Dismiss notification without declining (for manual dismissal)
  const dismissNotification = useCallback(() => {
    setShowIncomingCallNotification(false);
    stopRingtone();
    clearNotificationTimeout();
    // Don't clear incomingCall data in case user wants to handle it later
  }, [stopRingtone, clearNotificationTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearNotificationTimeout();
      stopRingtone();
    };
  }, [clearNotificationTimeout, stopRingtone]);

  return {
    incomingCall,
    showIncomingCallNotification,
    acceptIncomingCall,
    declineIncomingCall,
    dismissNotification,
  };
}