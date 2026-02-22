"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Calendar as CalendarIcon } from "lucide-react";
import { SessionsList, SessionDetailModal, CreateSessionModal } from "./sessions";
import { useSessions } from "@/hooks/community/useSessions";
import { GroupSession } from "@/types/api/sessions";
import { api } from "@/lib/api";
import type { CreateSessionRequest } from "@/types/api/sessions";

interface RoomContentTabsProps {
  postsContent: React.ReactNode;
  communityId?: string;
  roomId?: string;
  canCreateSession?: boolean;
  className?: string;
}

export function RoomContentTabs({
  postsContent,
  communityId,
  roomId,
  canCreateSession = false,
  className = "",
}: RoomContentTabsProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'sessions'>('posts');
  const [selectedSession, setSelectedSession] = useState<GroupSession | null>(null);
  const [isSessionDetailOpen, setIsSessionDetailOpen] = useState(false);
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [createSessionTherapistIds, setCreateSessionTherapistIds] = useState<string[]>([]);

  const { sessions, isLoading: sessionsLoading, fetchError, handleRSVP, isRSVPing, refreshSessions } = useSessions({
    communityId,
    roomId,
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

  const upcomingSessionsCount = sessions.filter(
    s => s.status === 'upcoming' || s.status === 'ongoing'
  ).length;

  const handleViewSessionDetails = (session: GroupSession) => {
    setSelectedSession(session);
    setIsSessionDetailOpen(true);
  };

  const handleSessionRSVP = async (sessionId: string, status: 'join' | 'leave') => {
    await handleRSVP(sessionId, status);
  };

  useEffect(() => {
    if (!selectedSession || sessions.length === 0) return;
    const updated = sessions.find((s) => s.id === selectedSession.id);
    if (updated && (updated.userRSVP !== selectedSession.userRSVP || updated.currentParticipants !== selectedSession.currentParticipants)) {
      setSelectedSession(updated);
    }
  }, [sessions, selectedSession?.id]);

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
        onValueChange={(value) => setActiveTab(value as 'posts' | 'sessions')}
        className={className}
      >
        <div className="px-4 lg:px-6 py-4 bg-white border-b flex justify-center">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50 p-1">
            <TabsTrigger value="posts" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              Events & Learning
              {upcomingSessionsCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {upcomingSessionsCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="posts" className="mt-0">
          {postsContent}
        </TabsContent>

        <TabsContent value="sessions" className="mt-0">
          <div className="max-w-4xl mx-auto p-4 lg:p-6">
            {fetchError && (
              <div className="mb-4 p-4 rounded-lg border border-destructive/50 bg-destructive/5 text-sm text-destructive">
                <p className="font-medium">Could not load sessions</p>
                <p className="mt-1">{fetchError.message}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => refreshSessions()}>
                  Try again
                </Button>
              </div>
            )}
            <SessionsList
              sessions={sessions}
              onViewDetails={handleViewSessionDetails}
              onRSVP={handleSessionRSVP}
              isRSVPing={isRSVPing}
              onCreateSession={() => setIsCreateSessionOpen(true)}
              canCreateSession={canCreateSession}
              communityId={communityId}
              roomId={roomId}
              isLoading={sessionsLoading}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Session Modals */}
      <SessionDetailModal
        session={selectedSession}
        isOpen={isSessionDetailOpen}
        onClose={() => {
          setIsSessionDetailOpen(false);
          setSelectedSession(null);
        }}
        onRSVP={handleSessionRSVP}
        isRSVPing={isRSVPing}
      />

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


