"use client";

import { useCallback } from "react";
import { useRealTimeEvents } from "./useRealTimeEvents";
import { getNamespacedSocket } from "@/lib/websocket";

interface UseRealTimeMeetingsConfig {
  userId: string;
  enableToasts?: boolean;
  enableBrowserNotifications?: boolean;
}

export function useRealTimeMeetings({
  userId,
  enableToasts = true,
  enableBrowserNotifications = true,
}: UseRealTimeMeetingsConfig) {
  // Use the standardized real-time events system for meetings
  const realTimeEvents = useRealTimeEvents({
    namespace: "/meetings",
    enableToasts,
    enableBrowserNotifications,
    subscriptions: [`meetings:${userId}`],
    toastFilter: (event) => {
      // Show toasts for meeting events
      return event.type.startsWith("meeting_");
    },
  });

  // Meeting-specific actions
  const joinMeeting = useCallback((meetingId: string, mediaPreferences?: { video: boolean; audio: boolean }) => {
    realTimeEvents.sendMessage("join-meeting", {
      meetingId,
      mediaPreferences,
    });
  }, [realTimeEvents]);

  const leaveMeeting = useCallback((meetingId: string) => {
    realTimeEvents.sendMessage("leave-meeting", {
      meetingId,
    });
  }, [realTimeEvents]);

  const toggleMedia = useCallback((meetingId: string, mediaType: "video" | "audio" | "screen", enabled: boolean) => {
    realTimeEvents.sendMessage("toggle-media", {
      meetingId,
      mediaType,
      enabled,
    });
  }, [realTimeEvents]);

  const setParticipantReady = useCallback((meetingId: string) => {
    realTimeEvents.sendMessage("participant-ready", {
      meetingId,
    });
  }, [realTimeEvents]);

  const sendChatMessage = useCallback((meetingId: string, message: string) => {
    realTimeEvents.sendMessage("chat-message", {
      meetingId,
      message,
      timestamp: new Date(),
    });
  }, [realTimeEvents]);

  const controlMeeting = useCallback((meetingId: string, action: "start" | "end" | "pause" | "record") => {
    realTimeEvents.sendMessage("meeting-control", {
      meetingId,
      action,
    });
  }, [realTimeEvents]);

  const sendWebRTCSignal = useCallback((meetingId: string, targetUserId: string, signal: any, type: "offer" | "answer" | "ice-candidate") => {
    realTimeEvents.sendMessage("webrtc-signal", {
      meetingId,
      targetUserId,
      signal,
      type,
    });
  }, [realTimeEvents]);

  return {
    // Connection state
    isConnected: realTimeEvents.isConnected,
    isConnecting: !realTimeEvents.isConnected,
    connectionState: realTimeEvents.isConnected ? "connected" : "disconnected",
    
    // Meeting actions
    joinMeeting,
    leaveMeeting,
    toggleMedia,
    setParticipantReady,
    sendChatMessage,
    controlMeeting,
    sendWebRTCSignal,
    
    // Generic actions
    reconnect: realTimeEvents.connect,
    disconnect: realTimeEvents.disconnect,
    
    // Standardized real-time events access
    realTimeEvents,
  };
}