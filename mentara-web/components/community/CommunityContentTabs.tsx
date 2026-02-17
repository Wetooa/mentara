"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SessionsList,
  SessionDetailModal,
  CreateSessionModal,
} from "./sessions";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Calendar } from "lucide-react";
import { useSessions } from "@/hooks/community/useSessions";
import { GroupSession } from "@/types/api/sessions";
import { api } from "@/lib/api";
import type { CreateSessionRequest } from "@/types/api/sessions";

interface CommunityContentTabsProps {
  postsContent: React.ReactNode;
  communityId?: string;
  roomId?: string;
  canCreateSession?: boolean;
}

export function CommunityContentTabs({
  postsContent,
  communityId,
  roomId,
  canCreateSession = false,
}: CommunityContentTabsProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "sessions">("posts");
  const [selectedSession, setSelectedSession] = useState<GroupSession | null>(
    null
  );
  const [isSessionDetailOpen, setIsSessionDetailOpen] = useState(false);
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [createSessionTherapistIds, setCreateSessionTherapistIds] = useState<
    string[]
  >([]);

  const { sessions, isLoading, handleRSVP, refreshSessions } = useSessions({
    communityId,
    roomId,
    status: ["upcoming", "ongoing"],
  });

  useEffect(() => {
    if (!isCreateSessionOpen || !communityId) return;
    api.communities
      .getCommunityMembers(communityId, 50)
      .then(({ members }) => {
        const ids = (members as { userId: string; user?: { role?: string } }[])
          .filter((m) => m.user?.role === "therapist")
          .map((m) => m.userId)
          .slice(0, 2);
        setCreateSessionTherapistIds(ids);
      })
      .catch(() => setCreateSessionTherapistIds([]));
  }, [isCreateSessionOpen, communityId]);

  const handleViewDetails = (session: GroupSession) => {
    setSelectedSession(session);
    setIsSessionDetailOpen(true);
  };

  const handleRSVPAction = async (
    sessionId: string,
    status: "join" | "leave"
  ) => {
    await handleRSVP(sessionId, status);
    // Refresh the selected session if it's open
    if (selectedSession?.id === sessionId) {
      const updatedSession = sessions.find((s) => s.id === sessionId);
      if (updatedSession) {
        setSelectedSession(updatedSession);
      }
    }
  };

  const handleCreateSession = () => {
    setIsCreateSessionOpen(true);
  };

  const handleCreateSessionSubmit = useCallback(
    async (data: CreateSessionRequest) => {
      if (createSessionTherapistIds.length === 0) {
        throw new Error(
          "This community has no therapist members. Add at least one therapist to the community to create a session."
        );
      }
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      const durationMinutes = Math.round(
        (end.getTime() - start.getTime()) / (60 * 1000)
      );
      const sessionFormat =
        data.format === "webinar" || data.format === "group-therapy"
          ? data.format
          : "group-therapy";
      await api.groupSessions.createSession({
        title: data.title,
        description: data.description ?? "",
        communityId: data.communityId,
        sessionType: data.type === "virtual" ? "VIRTUAL" : "IN_PERSON",
        sessionFormat,
        scheduledAt: data.startTime,
        duration: durationMinutes,
        maxParticipants: data.maxParticipants,
        virtualLink: data.meetingLink,
        location: data.location,
        therapistIds: createSessionTherapistIds,
      });
      await refreshSessions();
    },
    [createSessionTherapistIds, refreshSessions]
  );

  return (
    <>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "posts" | "sessions")}
      >
        <div className="px-4 lg:px-6 pt-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="posts" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-2">
              <Calendar className="h-4 w-4" />
              Events & Learning
              {sessions.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {sessions.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="posts" className="m-0 mt-4">
          {postsContent}
        </TabsContent>

        <TabsContent value="sessions" className="m-0 mt-4 px-4 lg:px-6 pb-6">
          <SessionsList
            sessions={sessions}
            onViewDetails={handleViewDetails}
            onRSVP={handleRSVPAction}
            onCreateSession={handleCreateSession}
            canCreateSession={canCreateSession}
            communityId={communityId}
            roomId={roomId}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Session Detail Modal */}
      <SessionDetailModal
        session={selectedSession}
        isOpen={isSessionDetailOpen}
        onClose={() => {
          setIsSessionDetailOpen(false);
          setSelectedSession(null);
        }}
        onRSVP={handleRSVPAction}
      />

      {/* Create Session Modal */}
      <CreateSessionModal
        isOpen={isCreateSessionOpen}
        onClose={() => setIsCreateSessionOpen(false)}
        onSubmit={handleCreateSessionSubmit}
        communityId={communityId ?? ""}
        roomId={roomId}
      />
    </>
  );
}
