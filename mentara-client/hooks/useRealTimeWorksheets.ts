"use client";

import { useCallback } from "react";
import { useRealTimeEvents } from "./useRealTimeEvents";

interface UseRealTimeWorksheetsConfig {
  userId: string;
  enableToasts?: boolean;
  enableBrowserNotifications?: boolean;
}

export function useRealTimeWorksheets({
  userId,
  enableToasts = true,
  enableBrowserNotifications = true,
}: UseRealTimeWorksheetsConfig) {
  // Use the standardized real-time events system for worksheets
  const realTimeEvents = useRealTimeEvents({
    namespace: "/messaging",
    enableToasts,
    enableBrowserNotifications,
    subscriptions: [`worksheets:${userId}`],
    toastFilter: (event) => {
      // Show toasts for worksheet events
      return event.type.startsWith("worksheet_");
    },
  });

  // Worksheet-specific actions
  const submitWorksheet = useCallback((worksheetId: string, answers: Record<string, any>) => {
    realTimeEvents.sendMessage("submit_worksheet", {
      worksheetId,
      answers,
      userId,
    });
  }, [realTimeEvents, userId]);

  const saveWorksheetProgress = useCallback((worksheetId: string, answers: Record<string, any>) => {
    realTimeEvents.sendMessage("save_worksheet_progress", {
      worksheetId,
      answers,
      userId,
    });
  }, [realTimeEvents, userId]);

  const assignWorksheet = useCallback((worksheetId: string, targetUserId: string) => {
    realTimeEvents.sendMessage("assign_worksheet", {
      worksheetId,
      targetUserId,
      assignedBy: userId,
    });
  }, [realTimeEvents, userId]);

  const updateWorksheetStatus = useCallback((worksheetId: string, status: "draft" | "assigned" | "in_progress" | "completed" | "reviewed") => {
    realTimeEvents.sendMessage("update_worksheet_status", {
      worksheetId,
      status,
      userId,
    });
  }, [realTimeEvents, userId]);

  const addWorksheetComment = useCallback((worksheetId: string, comment: string) => {
    realTimeEvents.sendMessage("add_worksheet_comment", {
      worksheetId,
      comment,
      userId,
    });
  }, [realTimeEvents, userId]);

  return {
    // Connection state
    isConnected: realTimeEvents.isConnected,
    isConnecting: !realTimeEvents.isConnected,
    connectionState: realTimeEvents.isConnected ? "connected" : "disconnected",
    
    // Worksheet actions
    submitWorksheet,
    saveWorksheetProgress,
    assignWorksheet,
    updateWorksheetStatus,
    addWorksheetComment,
    
    // Generic actions
    reconnect: realTimeEvents.connect,
    disconnect: realTimeEvents.disconnect,
    
    // Standardized real-time events access
    realTimeEvents,
  };
}