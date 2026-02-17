"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Calendar as CalendarIcon } from "lucide-react";
import { SessionsList, SessionDetailModal, CreateSessionModal } from "./sessions";
import { useSessions } from "@/hooks/community/useSessions";
import { GroupSession } from "@/types/api/sessions";

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

  // Use sessions hook
  const { sessions, isLoading: sessionsLoading, handleRSVP } = useSessions({
    communityId,
    roomId,
  });

  const upcomingSessionsCount = sessions.filter(
    s => s.status === 'upcoming' || s.status === 'ongoing'
  ).length;

  const handleViewSessionDetails = (session: GroupSession) => {
    setSelectedSession(session);
    setIsSessionDetailOpen(true);
  };

  const handleSessionRSVP = async (sessionId: string, status: 'join' | 'leave') => {
    await handleRSVP(sessionId, status);
    if (selectedSession?.id === sessionId) {
      const updatedSession = sessions.find(s => s.id === sessionId);
      if (updatedSession) {
        setSelectedSession(updatedSession);
      }
    }
  };

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
            <SessionsList
              sessions={sessions}
              onViewDetails={handleViewSessionDetails}
              onRSVP={handleSessionRSVP}
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
      />

      <CreateSessionModal
        isOpen={isCreateSessionOpen}
        onClose={() => setIsCreateSessionOpen(false)}
        communityId={communityId}
        roomId={roomId}
      />
    </>
  );
}


