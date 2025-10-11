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
        "cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden",
        isCancelled && "opacity-60",
        isOngoing && "ring-2 ring-red-500 ring-opacity-50"
      )}
      onClick={() => onViewDetails?.(session)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {getStatusBadge(session.status)}
              <Badge variant="secondary">
                {getFormatLabel(session.format)}
              </Badge>
              {session.isRecurring && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Recurring
                </Badge>
              )}
            </div>
            <h3 className="font-bold text-lg mb-1 line-clamp-2">
              {session.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {session.description}
            </p>
          </div>
        </div>

        {/* Host Info */}
        <div className="flex items-center gap-2 py-2 border-t">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.host.avatarUrl} alt={session.host.name} />
            <AvatarFallback>{session.host.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{session.host.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {session.host.credentials}
            </p>
          </div>
          <Badge className={cn("flex-shrink-0", typeInfo.color)}>
            <TypeIcon className="h-3 w-3 mr-1" />
            {typeInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Time & Location */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span>{formatSessionTime()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span>{session.duration} minutes</span>
          </div>
          {(session.type === "in-person" || session.type === "hybrid") &&
            session.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{session.location}</span>
              </div>
            )}
          {(session.type === "virtual" || session.type === "hybrid") && (
            <div className="flex items-center gap-2 text-sm">
              <Video className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-blue-600">
                Online meeting link available
              </span>
            </div>
          )}
        </div>

        {/* Capacity */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {session.currentParticipants}/{session.maxParticipants}{" "}
                participants
              </span>
            </div>
            {session.waitlistCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {session.waitlistCount} on waitlist
              </span>
            )}
          </div>
          <Progress value={capacityPercentage} className="h-2" />
          {isFull && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Session is full - join waitlist
            </p>
          )}
        </div>

        {/* Tags */}
        {session.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {session.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {session.tags.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{session.tags.length - 4} more
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {!isCancelled && !isCompleted && (
            <Button
              size="sm"
              variant={isUserAttending ? "outline" : "default"}
              className="flex-1"
              onClick={handleRSVPClick}
              disabled={isFull && !isUserAttending && !isUserWaitlisted}
            >
              {isUserAttending && (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Attending
                </>
              )}
              {isUserWaitlisted && (
                <>
                  <AlertCircle className="h-4 w-4 mr-1.5" />
                  On Waitlist
                </>
              )}
              {!isUserAttending && !isUserWaitlisted && (
                <>
                  <User className="h-4 w-4 mr-1.5" />
                  {isFull ? "Join Waitlist" : "Join Session"}
                </>
              )}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(session);
            }}
          >
            Details
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
