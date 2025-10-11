// Custom hook for managing sessions with mock data

import { useState, useCallback, useMemo } from "react";
import { GroupSession, SessionFilters } from "@/types/api/sessions";
import {
  mockSessions,
  getUpcomingSessions,
  getOngoingSessions,
  getCompletedSessions,
  getSessionById,
  mockRSVPToSession,
} from "@/lib/mock-data/sessions";

export function useSessions(filters?: SessionFilters) {
  const [sessions, setSessions] = useState<GroupSession[]>(mockSessions);
  const [isLoading, setIsLoading] = useState(false);

  // Filter sessions based on provided filters
  const filteredSessions = useMemo(() => {
    if (!filters) return sessions;

    let filtered = sessions;

    if (filters.communityId) {
      filtered = filtered.filter((s) => s.communityId === filters.communityId);
    }

    if (filters.roomId) {
      filtered = filtered.filter((s) => s.roomId === filters.roomId);
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((s) => filters.status?.includes(s.status));
    }

    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter((s) => filters.type?.includes(s.type));
    }

    if (filters.format && filters.format.length > 0) {
      filtered = filtered.filter((s) => filters.format?.includes(s.format));
    }

    if (filters.hostId) {
      filtered = filtered.filter(
        (s) =>
          s.host.id === filters.hostId ||
          s.coHosts?.some((h) => h.id === filters.hostId)
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((s) =>
        filters.tags?.some((tag) => s.tags.includes(tag))
      );
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter((s) => new Date(s.startTime) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filtered = filtered.filter((s) => new Date(s.startTime) <= endDate);
    }

    if (filters.onlyUserSessions) {
      filtered = filtered.filter(
        (s) => s.userRSVP === "attending" || s.userRSVP === "waitlist"
      );
    }

    return filtered;
  }, [sessions, filters]);

  // RSVP to a session
  const handleRSVP = useCallback(
    async (sessionId: string, status: "join" | "leave") => {
      setIsLoading(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const result = mockRSVPToSession(sessionId, status);

      if (result.success) {
        // Update the sessions state
        setSessions((prevSessions) =>
          prevSessions.map((s) => {
            if (s.id === sessionId) {
              const updatedSession = getSessionById(sessionId);
              return updatedSession || s;
            }
            return s;
          })
        );
      }

      setIsLoading(false);
      return result;
    },
    []
  );

  // Get a single session
  const getSession = useCallback(
    (sessionId: string) => {
      return sessions.find((s) => s.id === sessionId);
    },
    [sessions]
  );

  // Refresh sessions
  const refreshSessions = useCallback(async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));
    setSessions([...mockSessions]);
    setIsLoading(false);
  }, []);

  return {
    sessions: filteredSessions,
    isLoading,
    handleRSVP,
    getSession,
    refreshSessions,
  };
}

// Hook for getting upcoming sessions specifically
export function useUpcomingSessions(communityId?: string) {
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useState(() => {
    const upcoming = getUpcomingSessions(communityId);
    setSessions(upcoming);
    setIsLoading(false);
  });

  return {
    sessions,
    isLoading,
  };
}

// Hook for session detail
export function useSessionDetail(sessionId: string) {
  const [session, setSession] = useState<GroupSession | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useState(() => {
    const foundSession = getSessionById(sessionId);
    setSession(foundSession);
    setIsLoading(false);
  });

  const handleRSVP = useCallback(
    async (status: "join" | "leave") => {
      const result = mockRSVPToSession(sessionId, status);
      if (result.success) {
        const updatedSession = getSessionById(sessionId);
        setSession(updatedSession);
      }
      return result;
    },
    [sessionId]
  );

  return {
    session,
    isLoading,
    handleRSVP,
  };
}
