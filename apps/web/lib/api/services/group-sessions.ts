import { AxiosInstance } from "axios";
import type {
  GroupSession,
  SessionFormat,
  SessionStatus,
  SessionType,
} from "@/types/api/sessions";

/**
 * API response shape for a single group session (list or detail).
 */
export interface ApiGroupSession {
  id: string;
  title: string;
  description: string | null;
  communityId: string;
  createdById: string;
  sessionType: "VIRTUAL" | "IN_PERSON";
  sessionFormat?: string | null;
  scheduledAt: string;
  duration: number;
  maxParticipants: number;
  virtualLink: string | null;
  location: string | null;
  locationAddress: string | null;
  status: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  therapistInvitations?: Array<{
    status: string;
    therapist: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
  }>;
  participants?: Array<{
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string | null;
    };
  }>;
  _count?: { participants: number };
  community?: { id: string; name: string };
  /** Set by API when the current user has joined this session */
  currentUserJoined?: boolean;
}

export interface GetSessionsByCommunityOptions {
  status?: string;
  upcoming?: boolean;
}

function deriveStatus(session: ApiGroupSession): SessionStatus {
  if (session.status === "CANCELLED") return "cancelled";
  if (session.status === "COMPLETED") return "completed";
  if (session.status === "IN_PROGRESS") return "ongoing";
  const start = new Date(session.scheduledAt);
  const end = new Date(start.getTime() + session.duration * 60 * 1000);
  const now = new Date();
  if (now >= end) return "completed";
  if (now >= start) return "ongoing";
  return "upcoming";
}

/**
 * Map API group session to frontend GroupSession type.
 */
export function mapApiSessionToGroupSession(
  session: ApiGroupSession,
  currentUserId?: string | null
): GroupSession {
  const start = new Date(session.scheduledAt);
  const end = new Date(start.getTime() + session.duration * 60 * 1000);
  const format = (session.sessionFormat ?? "group-therapy") as SessionFormat;
  const type: SessionType =
    session.sessionType === "VIRTUAL" ? "virtual" : "in-person";
  const status = deriveStatus(session);
  const participantCount = session._count?.participants ?? 0;

  const host = {
    id: session.createdBy.id,
    name: `${session.createdBy.firstName} ${session.createdBy.lastName}`.trim(),
    role: "moderator" as const,
  };

  const coHosts =
    session.therapistInvitations?.map((inv) => ({
      id: "",
      name: `${inv.therapist.user.firstName} ${inv.therapist.user.lastName}`.trim(),
      role: "therapist" as const,
    })) ?? [];

  const participants =
    session.participants?.map((p) => ({
      id: p.userId,
      userId: p.userId,
      sessionId: session.id,
      status: "attending" as const,
      joinedAt: new Date().toISOString(),
      user: {
        id: p.user.id,
        firstName: p.user.firstName,
        lastName: p.user.lastName,
        avatarUrl: p.user.avatarUrl ?? undefined,
      },
    })) ?? [];

  const userRSVP =
    session.currentUserJoined === true
      ? ("attending" as const)
      : currentUserId && participants.some((p) => p.userId === currentUserId)
        ? ("attending" as const)
        : undefined;

  return {
    id: session.id,
    title: session.title,
    description: session.description ?? "",
    type,
    format,
    startTime: session.scheduledAt,
    endTime: end.toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    duration: session.duration,
    maxParticipants: session.maxParticipants,
    currentParticipants: participantCount,
    waitlistCount: 0,
    location: session.location ?? undefined,
    meetingLink: session.virtualLink ?? undefined,
    host,
    coHosts: coHosts.length > 0 ? coHosts : undefined,
    communityId: session.communityId,
    communityName: session.community?.name,
    status,
    tags: [],
    requiresApproval: false,
    isRecurring: false,
    participants,
    waitlist: [],
    createdAt: session.scheduledAt,
    updatedAt: session.scheduledAt,
    userRSVP,
  };
}

export function createGroupSessionsService(axios: AxiosInstance) {
  return {
    /**
     * Get group sessions for a community.
     */
    async getSessionsByCommunity(
      communityId: string,
      options?: GetSessionsByCommunityOptions
    ): Promise<GroupSession[]> {
      const params = new URLSearchParams();
      if (options?.status) params.set("status", options.status);
      if (options?.upcoming !== undefined)
        params.set("upcoming", String(options.upcoming));
      const qs = params.toString();
      const url = `group-sessions/community/${communityId}${qs ? `?${qs}` : ""}`;
      const { data } = await axios.get<ApiGroupSession[] | { sessions?: ApiGroupSession[]; data?: ApiGroupSession[] }>(url);
      const raw = Array.isArray(data)
        ? data
        : Array.isArray((data as { sessions?: ApiGroupSession[] })?.sessions)
          ? (data as { sessions: ApiGroupSession[] }).sessions
          : Array.isArray((data as { data?: ApiGroupSession[] })?.data)
            ? (data as { data: ApiGroupSession[] }).data
            : [];
      return raw.map((s) => mapApiSessionToGroupSession(s));
    },

    /**
     * Get a single session by ID (for detail view / userRSVP).
     */
    async getSession(sessionId: string): Promise<GroupSession | null> {
      try {
        const { data } = await axios.get<ApiGroupSession>(
          `group-sessions/${sessionId}`
        );
        return mapApiSessionToGroupSession(data);
      } catch {
        return null;
      }
    },

    /**
     * Join a session (register / RSVP).
     */
    async joinSession(sessionId: string): Promise<void> {
      await axios.post(`group-sessions/${sessionId}/join`);
    },

    /**
     * Leave a session (cancel registration).
     */
    async leaveSession(sessionId: string): Promise<void> {
      await axios.delete(`group-sessions/${sessionId}/leave`);
    },

    /**
     * Get sessions the current user has joined.
     */
    async getMySessions(upcoming?: boolean): Promise<GroupSession[]> {
      const params = upcoming !== undefined ? `?upcoming=${upcoming}` : "";
      const { data } = await axios.get<ApiGroupSession[]>(
        `group-sessions/my/sessions${params}`
      );
      return (Array.isArray(data) ? data : []).map((s) =>
        mapApiSessionToGroupSession(s)
      );
    },

    /**
     * Create a new group session (moderator only).
     * Maps frontend CreateSessionRequest-like fields to API DTO.
     */
    async createSession(payload: {
      title: string;
      description: string;
      communityId: string;
      sessionType: "VIRTUAL" | "IN_PERSON";
      sessionFormat?: "group-therapy" | "webinar";
      scheduledAt: string; // ISO
      duration: number;
      maxParticipants: number;
      virtualLink?: string;
      location?: string;
      locationAddress?: string;
      therapistIds: string[];
    }): Promise<ApiGroupSession> {
      const { data } = await axios.post<ApiGroupSession>(
        "group-sessions",
        payload
      );
      return data;
    },
  };
}

export type GroupSessionsService = ReturnType<typeof createGroupSessionsService>;
