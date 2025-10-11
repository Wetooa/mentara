"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SessionsList,
  SessionDetailModal,
  CreateSessionModal,
} from "./sessions";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Calendar, Video } from "lucide-react";
import { useSessions } from "@/hooks/community/useSessions";
import { GroupSession } from "@/types/api/sessions";

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

  // Use sessions hook with filters
  const { sessions, isLoading, handleRSVP } = useSessions({
    communityId,
    roomId,
    status: ["upcoming", "ongoing"],
  });

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
              Sessions
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
        communityId={communityId}
        roomId={roomId}
      />
    </>
  );
}
