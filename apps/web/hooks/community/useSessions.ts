import { useCallback, useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GroupSession, SessionFilters } from "@/types/api/sessions";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

function is409(err: unknown): boolean {
  return (
    !!err &&
    typeof err === "object" &&
    "response" in err &&
    typeof (err as { response?: { status?: number } }).response?.status === "number" &&
    (err as { response: { status: number } }).response.status === 409
  );
}

export function useSessions(filters?: SessionFilters) {
  const queryClient = useQueryClient();
  const communityId = filters?.communityId;
  const wantUpcomingOrOngoing =
    filters?.status?.includes("upcoming") || filters?.status?.includes("ongoing");

  const queryKey = queryKeys.communities.groupSessions(
    communityId ?? "",
    wantUpcomingOrOngoing
  );

  const {
    data: sessions = [],
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const list = await api.groupSessions.getSessionsByCommunity(communityId!, {
        upcoming: wantUpcomingOrOngoing ? true : undefined,
      });
      const byId = new Map<string, GroupSession>();
      for (const s of list) {
        const existing = byId.get(s.id);
        if (!existing || s.userRSVP === "attending") byId.set(s.id, s);
      }
      return Array.from(byId.values());
    },
    enabled: !!communityId,
    staleTime: 60 * 1000,
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({
      sessionId,
      status,
    }: {
      sessionId: string;
      status: "join" | "leave";
    }) => {
      if (status === "join") {
        await api.groupSessions.joinSession(sessionId);
      } else {
        await api.groupSessions.leaveSession(sessionId);
      }
    },
    onSuccess: (_, { sessionId: _sessionId }) => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err, { sessionId }, _context) => {
      if (is409(err)) {
        queryClient.setQueryData<GroupSession[]>(queryKey, (prev) => {
          if (!prev) return prev;
          return prev.map((s) =>
            s.id === sessionId ? { ...s, userRSVP: "attending" as const } : s
          );
        });
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });

  const fetchError = queryError
    ? queryError instanceof Error
      ? queryError
      : new Error(String(queryError))
    : null;
  const fetchSessions = useCallback(async () => {
    await refetch();
  }, [refetch]);
  const refreshSessions = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleRSVP = useCallback(
    async (sessionId: string, status: "join" | "leave") => {
      try {
        await rsvpMutation.mutateAsync({ sessionId, status });
        return { success: true };
      } catch {
        return { success: false };
      }
    },
    [rsvpMutation]
  );

  const filteredSessions = useMemo(() => {
    if (!filters) return sessions;

    let filtered = sessions;

    if (filters.communityId) {
      filtered = filtered.filter((s) => s.communityId === filters.communityId);
    }

    // Sessions/webinars are community-level, not room-level; do not filter by roomId

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

  const getSession = useCallback(
    (sessionId: string) => {
      return sessions.find((s) => s.id === sessionId);
    },
    [sessions]
  );

  return {
    sessions: filteredSessions,
    isLoading,
    fetchError,
    handleRSVP,
    isRSVPing: rsvpMutation.isPending,
    getSession,
    refreshSessions,
  };
}

export function useUpcomingSessions(communityId?: string) {
  const { sessions, isLoading } = useSessions({
    communityId,
    status: ["upcoming", "ongoing"],
  });

  return {
    sessions,
    isLoading,
  };
}

export function useSessionDetail(sessionId: string) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<GroupSession | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const s = await api.groupSessions.getSession(sessionId);
      setSession(s ?? undefined);
    } catch {
      setSession(undefined);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const rsvpMutation = useMutation({
    mutationFn: async (status: "join" | "leave") => {
      if (status === "join") {
        await api.groupSessions.joinSession(sessionId);
      } else {
        await api.groupSessions.leaveSession(sessionId);
      }
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "communities" &&
          query.queryKey[1] === "groupSessions",
      });
      await fetchDetail();
    },
    onError: (err) => {
      if (is409(err)) {
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === "communities" &&
            query.queryKey[1] === "groupSessions",
        });
        fetchDetail();
      }
    },
  });

  const handleRSVP = useCallback(
    async (status: "join" | "leave") => {
      try {
        await rsvpMutation.mutateAsync(status);
        return { success: true };
      } catch {
        return { success: false };
      }
    },
    [rsvpMutation]
  );

  return {
    session,
    isLoading,
    handleRSVP,
    isRSVPing: rsvpMutation.isPending,
  };
}
