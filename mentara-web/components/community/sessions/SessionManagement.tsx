"use client";

import { useState } from "react";
import { GroupSession } from "@/types/api/sessions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Users,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Video,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SessionManagementProps {
  sessions: GroupSession[];
  onCreateSession?: () => void;
  onEditSession?: (session: GroupSession) => void;
  onDeleteSession?: (sessionId: string) => void;
  onDuplicateSession?: (session: GroupSession) => void;
  onCancelSession?: (sessionId: string) => void;
}

export function SessionManagement({
  sessions,
  onCreateSession,
  onEditSession,
  onDeleteSession,
  onDuplicateSession,
  onCancelSession,
}: SessionManagementProps) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const upcomingSessions = sessions.filter(
    (s) => s.status === "upcoming" || s.status === "ongoing"
  );
  const pastSessions = sessions.filter(
    (s) => s.status === "completed" || s.status === "cancelled"
  );

  const displaySessions = activeTab === "upcoming" ? upcomingSessions : pastSessions;

  const handleCopyMeetingLink = (session: GroupSession) => {
    if (session.meetingLink) {
      navigator.clipboard.writeText(session.meetingLink);
      toast.success("Meeting link copied to clipboard");
    }
  };

  const handleDelete = (session: GroupSession) => {
    if (
      confirm(
        `Are you sure you want to delete "${session.title}"? This action cannot be undone.`
      )
    ) {
      onDeleteSession?.(session.id);
      toast.success("Session deleted successfully");
    }
  };

  const handleCancel = (session: GroupSession) => {
    if (
      confirm(
        `Are you sure you want to cancel "${session.title}"? Participants will be notified.`
      )
    ) {
      onCancelSession?.(session.id);
      toast.success("Session cancelled successfully");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Session Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage your community group sessions
          </p>
        </div>
        <Button onClick={onCreateSession}>
          <Plus className="h-4 w-4 mr-2" />
          Create Session
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingSessions.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Participants</p>
                <p className="text-2xl font-bold">
                  {sessions.reduce((sum, s) => sum + s.currentParticipants, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {sessions.filter((s) => s.status === "completed").length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingSessions.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastSessions.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {displaySessions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sessions found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {activeTab === "upcoming"
                  ? "Create your first session to get started"
                  : "No past sessions yet"}
              </p>
              {activeTab === "upcoming" && (
                <Button onClick={onCreateSession}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Session
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {displaySessions.map((session) => {
                const isOngoing = session.status === "ongoing";
                const isCancelled = session.status === "cancelled";
                const isCompleted = session.status === "completed";
                const isFull =
                  session.currentParticipants >= session.maxParticipants;

                return (
                  <Card
                    key={session.id}
                    className={cn(
                      "border-l-4",
                      isOngoing && "border-l-red-500 bg-red-50/50",
                      isCancelled && "border-l-gray-400 opacity-60",
                      isCompleted && "border-l-green-500",
                      !isOngoing &&
                        !isCancelled &&
                        !isCompleted &&
                        "border-l-blue-500"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        {/* Session Info */}
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Title and Status */}
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">
                                {session.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {isOngoing && (
                                  <Badge
                                    variant="destructive"
                                    className="animate-pulse"
                                  >
                                    Live Now
                                  </Badge>
                                )}
                                {isCancelled && (
                                  <Badge variant="outline">Cancelled</Badge>
                                )}
                                {isCompleted && (
                                  <Badge variant="secondary">Completed</Badge>
                                )}
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    session.type === "virtual" &&
                                      "bg-blue-50 text-blue-700",
                                    session.type === "in-person" &&
                                      "bg-green-50 text-green-700",
                                    session.type === "hybrid" &&
                                      "bg-purple-50 text-purple-700"
                                  )}
                                >
                                  {session.type === "virtual" && (
                                    <Video className="h-3 w-3 mr-1" />
                                  )}
                                  {session.type === "in-person" && (
                                    <MapPin className="h-3 w-3 mr-1" />
                                  )}
                                  {session.type === "hybrid" && (
                                    <Users className="h-3 w-3 mr-1" />
                                  )}
                                  {session.type}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                {format(
                                  new Date(session.startTime),
                                  "MMM dd, yyyy • h:mm a"
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>
                                {session.currentParticipants}/
                                {session.maxParticipants} participants
                              </span>
                              {isFull && (
                                <Badge variant="outline" className="text-xs">
                                  Full
                                </Badge>
                              )}
                              {session.waitlistCount > 0 && (
                                <span className="text-xs">
                                  ({session.waitlistCount} on waitlist)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!isCancelled && !isCompleted && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => onEditSession?.(session)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => onDuplicateSession?.(session)}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                {(session.type === "virtual" ||
                                  session.type === "hybrid") &&
                                  session.meetingLink && (
                                    <DropdownMenuItem
                                      onClick={() => handleCopyMeetingLink(session)}
                                    >
                                      <Video className="h-4 w-4 mr-2" />
                                      Copy Meeting Link
                                    </DropdownMenuItem>
                                  )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleCancel(session)}
                                  className="text-orange-600"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel Session
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDelete(session)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

