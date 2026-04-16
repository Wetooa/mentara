"use client";

import { GroupSession } from "@/types/api/sessions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Users, Video, MapPin, ArrowRight } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface UpcomingSessionsWidgetProps {
  sessions: GroupSession[];
  onViewSession?: (session: GroupSession) => void;
  onViewAll?: () => void;
  maxSessions?: number;
}

export function UpcomingSessionsWidget({
  sessions,
  onViewSession,
  onViewAll,
  maxSessions = 3,
}: UpcomingSessionsWidgetProps) {
  const displaySessions = sessions.slice(0, maxSessions);

  if (sessions.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming Sessions
          </CardTitle>
          {sessions.length > maxSessions && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="text-xs h-auto py-1"
            >
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displaySessions.map((session) => {
          const isOngoing = session.status === "ongoing";
          const isFull = session.currentParticipants >= session.maxParticipants;

          return (
            <div
              key={session.id}
              className={cn(
                "p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors",
                isOngoing && "bg-red-50 border-red-200"
              )}
              onClick={() => onViewSession?.(session)}
            >
              {/* Header with status */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {session.type === "virtual" && (
                    <Video className="h-3 w-3 text-blue-600 flex-shrink-0" />
                  )}
                  {session.type === "in-person" && (
                    <MapPin className="h-3 w-3 text-green-600 flex-shrink-0" />
                  )}
                  {session.type === "hybrid" && (
                    <Users className="h-3 w-3 text-purple-600 flex-shrink-0" />
                  )}
                  <h4 className="font-medium text-sm line-clamp-1">
                    {session.title}
                  </h4>
                </div>
                {isOngoing && (
                  <Badge
                    variant="destructive"
                    className="text-xs h-5 animate-pulse"
                  >
                    Live
                  </Badge>
                )}
              </div>

              {/* Host */}
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={session.host.avatarUrl} />
                  <AvatarFallback className="text-xs">
                    {session.host.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate">
                  {session.host.name}
                </span>
              </div>

              {/* Time and Capacity */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {format(new Date(session.startTime), "MMM dd, h:mm a")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>
                    {session.currentParticipants}/{session.maxParticipants}
                  </span>
                  {isFull && (
                    <Badge variant="outline" className="text-xs h-4 px-1">
                      Full
                    </Badge>
                  )}
                </div>
              </div>

              {/* User RSVP Status */}
              {session.userRSVP === "attending" && (
                <div className="mt-2 pt-2 border-t">
                  <Badge variant="secondary" className="text-xs">
                    You're attending
                  </Badge>
                </div>
              )}
            </div>
          );
        })}

        {onViewAll && sessions.length > maxSessions && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={onViewAll}
          >
            View All {sessions.length} Sessions
            <ArrowRight className="h-3 w-3 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

