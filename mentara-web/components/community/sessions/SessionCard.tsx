"use client";

import {
  GroupSession,
  SessionType,
  SessionFormat,
  SessionStatus,
} from "@/types/api/sessions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface SessionCardProps {
  session: GroupSession;
  onViewDetails?: (session: GroupSession) => void;
  onRSVP?: (sessionId: string, status: "join" | "leave") => void;
  variant?: "default" | "compact";
}

export function SessionCard({
  session,
  onViewDetails,
  onRSVP,
  variant = "default",
}: SessionCardProps) {
  const isUpcoming = session.status === "upcoming";
  const isOngoing = session.status === "ongoing";
  const isCompleted = session.status === "completed";
  const isCancelled = session.status === "cancelled";
  const isFull = session.currentParticipants >= session.maxParticipants;
  const isUserAttending = session.userRSVP === "attending";
  const isUserWaitlisted = session.userRSVP === "waitlist";
  const isWebinar = session.format === "webinar";

  const capacityPercentage =
    (session.currentParticipants / session.maxParticipants) * 100;

  // Get type icon and color
  const getTypeInfo = (type: SessionType) => {
    switch (type) {
      case "virtual":
        return {
          icon: Video,
          color: "text-blue-600 bg-blue-50",
          label: "Virtual",
        };
      case "in-person":
        return {
          icon: MapPin,
          color: "text-green-600 bg-green-50",
          label: "In-Person",
        };
      case "hybrid":
        return {
          icon: Users,
          color: "text-purple-600 bg-purple-50",
          label: "Hybrid",
        };
    }
  };

  // Get status badge
  const getStatusBadge = (status: SessionStatus) => {
    switch (status) {
      case "upcoming":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Upcoming
          </Badge>
        );
      case "ongoing":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 animate-pulse"
          >
            <span className="relative flex h-2 w-2 mr-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Live Now
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Cancelled
          </Badge>
        );
    }
  };

  // Get format label
  const getFormatLabel = (format: SessionFormat) => {
    const formatMap: Record<SessionFormat, string> = {
      "group-therapy": "Group Therapy",
      workshop: "Workshop",
      "support-circle": "Support Circle",
      webinar: "Webinar",
      meditation: "Meditation",
      social: "Social",
    };
    return formatMap[format] || format;
  };

  const typeInfo = getTypeInfo(session.type);
  const TypeIcon = typeInfo.icon;

  const formatSessionTime = () => {
    const startDate = new Date(session.startTime);
    const endDate = new Date(session.endTime);

    if (isOngoing) {
      return `Started ${formatDistanceToNow(startDate, { addSuffix: true })}`;
    }

    if (isCompleted) {
      return format(startDate, "MMM dd, yyyy");
    }

    return format(startDate, "MMM dd, yyyy • h:mm a");
  };

  const handleRSVPClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRSVP) {
      if (isUserAttending || isUserWaitlisted) {
        onRSVP(session.id, "leave");
      } else {
        onRSVP(session.id, "join");
      }
    }
  };

  if (variant === "compact") {
    return (
      <Card
        className={cn(
          "cursor-pointer hover:shadow-md transition-all duration-200 border-l-4",
          isCancelled && "opacity-60",
          isOngoing && "border-l-red-500",
          isUpcoming && "border-l-blue-500",
          isCompleted && "border-l-gray-400"
        )}
        onClick={() => onViewDetails?.(session)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {getStatusBadge(session.status)}
                <Badge variant="secondary" className="text-xs">
                  {getFormatLabel(session.format)}
                </Badge>
              </div>
              <h3 className="font-semibold text-sm truncate mb-1">
                {session.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatSessionTime()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>
                    {session.currentParticipants}/{session.maxParticipants}
                  </span>
                </div>
              </div>
            </div>
            <TypeIcon
              className={cn(
                "h-5 w-5 flex-shrink-0",
                typeInfo.color.split(" ")[0]
              )}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-md transition-all duration-200",
        isCancelled && "opacity-60",
        isOngoing && "border-l-4 border-l-red-500"
      )}
      onClick={() => onViewDetails?.(session)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header: Status + Title */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge(session.status)}
              <Badge className={cn("text-xs", typeInfo.color)}>
                <TypeIcon className="h-3 w-3 mr-1" />
                {typeInfo.label}
              </Badge>
            </div>
            <h3 className="font-bold text-base line-clamp-1 mb-1">
              {session.title}
            </h3>
          </div>

          {/* Host Info - Compact */}
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={session.host.avatarUrl} alt={session.host.name} />
              <AvatarFallback className="text-xs">{session.host.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.host.name}</p>
            </div>
          </div>

          {/* Key Details - Condensed */}
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{formatSessionTime()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">
                {session.currentParticipants}/{session.maxParticipants} joined
                {isFull && <span className="text-amber-600 ml-1">(Full)</span>}
              </span>
            </div>
          </div>

          {/* Action Button */}
          {!isCancelled && !isCompleted && (
            <Button
              size="sm"
              variant={isUserAttending ? "outline" : "default"}
              className="w-full"
              onClick={handleRSVPClick}
              disabled={isFull && !isUserAttending && !isUserWaitlisted}
            >
              {isUserAttending && (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  {isWebinar ? "Registered" : "Attending"}
                </>
              )}
              {isUserWaitlisted && (
                <>
                  <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                  Waitlisted
                </>
              )}
              {!isUserAttending && !isUserWaitlisted && (
                <>
                  <User className="h-3.5 w-3.5 mr-1.5" />
                  {isFull ? "Join Waitlist" : isWebinar ? "Register" : "Join Session"}
                </>
              )}
            </Button>
          )}
          {isCompleted && (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(session);
              }}
            >
              View Recording
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
