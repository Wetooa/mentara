"use client";

import { GroupSession } from "@/types/api/sessions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  User,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Download,
  FileText,
  PlayCircle,
  Share2,
  Bell,
  X,
} from "lucide-react";
import { format, formatDistanceToNow, addMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

interface SessionDetailModalProps {
  session: GroupSession | null;
  isOpen: boolean;
  onClose: () => void;
  onRSVP?: (sessionId: string, status: "join" | "leave") => void;
}

export function SessionDetailModal({
  session,
  isOpen,
  onClose,
  onRSVP,
}: SessionDetailModalProps) {
  const [isRSVPing, setIsRSVPing] = useState(false);

  if (!session) return null;

  const isUpcoming = session.status === "upcoming";
  const isOngoing = session.status === "ongoing";
  const isCompleted = session.status === "completed";
  const isCancelled = session.status === "cancelled";
  const isFull = session.currentParticipants >= session.maxParticipants;
  const isUserAttending = session.userRSVP === "attending";
  const isUserWaitlisted = session.userRSVP === "waitlist";

  const capacityPercentage =
    (session.currentParticipants / session.maxParticipants) * 100;

  const handleRSVP = async (status: "join" | "leave") => {
    if (onRSVP) {
      setIsRSVPing(true);
      try {
        await onRSVP(session.id, status);
        const message =
          status === "join"
            ? isFull
              ? "Added to waitlist"
              : "Successfully joined session"
            : "Successfully left session";
        toast.success(message);
      } catch (error) {
        toast.error("Failed to update RSVP");
      } finally {
        setIsRSVPing(false);
      }
    }
  };

  const copyMeetingLink = () => {
    if (session.meetingLink) {
      navigator.clipboard.writeText(session.meetingLink);
      toast.success("Meeting link copied to clipboard");
    }
  };

  const downloadICS = () => {
    // Create ICS file content
    const startDate = new Date(session.startTime);
    const endDate = new Date(session.endTime);

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Mentara//Group Sessions//EN
BEGIN:VEVENT
UID:${session.id}@mentara.app
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${session.title}
DESCRIPTION:${session.description}
LOCATION:${session.type === "virtual" ? session.meetingLink : session.location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${session.title.replace(/\s+/g, "-")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Calendar event downloaded");
  };

  const formatSessionTime = () => {
    const startDate = new Date(session.startTime);
    const endDate = new Date(session.endTime);

    return {
      date: format(startDate, "EEEE, MMMM dd, yyyy"),
      time: `${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")} ${session.timezone}`,
      relative: isOngoing
        ? `Started ${formatDistanceToNow(startDate, { addSuffix: true })}`
        : isCompleted
          ? `Ended ${formatDistanceToNow(endDate, { addSuffix: true })}`
          : `Starts ${formatDistanceToNow(startDate, { addSuffix: true })}`,
    };
  };

  const timeInfo = formatSessionTime();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6 space-y-6">
            {/* Header */}
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isOngoing && (
                      <Badge variant="destructive" className="animate-pulse">
                        <span className="relative flex h-2 w-2 mr-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        Live Now
                      </Badge>
                    )}
                    {isUpcoming && <Badge variant="outline">Upcoming</Badge>}
                    {isCompleted && (
                      <Badge variant="secondary">Completed</Badge>
                    )}
                    {isCancelled && (
                      <Badge variant="destructive">Cancelled</Badge>
                    )}

                    <Badge
                      className={cn(
                        session.type === "virtual" &&
                          "bg-blue-100 text-blue-700",
                        session.type === "in-person" &&
                          "bg-green-100 text-green-700",
                        session.type === "hybrid" &&
                          "bg-purple-100 text-purple-700"
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
                      {session.type.charAt(0).toUpperCase() +
                        session.type.slice(1)}
                    </Badge>

                    {session.isRecurring && (
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        Recurring
                      </Badge>
                    )}
                  </div>

                  <DialogTitle className="text-2xl font-bold">
                    {session.title}
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    {session.description}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Separator />

            {/* Host Information */}
            <div className="space-y-3">
              <h3 className="font-semibold">Hosted by</h3>
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={session.host.avatarUrl}
                    alt={session.host.name}
                  />
                  <AvatarFallback>{session.host.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{session.host.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {session.host.credentials}
                  </p>
                  {session.host.bio && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {session.host.bio}
                    </p>
                  )}
                </div>
              </div>

              {session.coHosts && session.coHosts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Co-hosts
                  </p>
                  {session.coHosts.map((coHost) => (
                    <div key={coHost.id} className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={coHost.avatarUrl} alt={coHost.name} />
                        <AvatarFallback>{coHost.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{coHost.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {coHost.credentials}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Session Details */}
            <div className="space-y-4">
              <h3 className="font-semibold">Session Details</h3>

              <div className="space-y-3">
                {/* Date & Time */}
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{timeInfo.date}</p>
                    <p className="text-sm text-muted-foreground">
                      {timeInfo.time}
                    </p>
                    <p className="text-sm text-blue-600">{timeInfo.relative}</p>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>{session.duration} minutes</span>
                </div>

                {/* Location/Link */}
                {(session.type === "virtual" || session.type === "hybrid") &&
                  session.meetingLink && (
                    <div className="flex items-start gap-3">
                      <Video className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium mb-1">Virtual Meeting</p>
                        {isUserAttending && !isCancelled && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={copyMeetingLink}
                              className="text-xs"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy Link
                            </Button>
                            {(isUpcoming || isOngoing) && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  window.open(session.meetingLink, "_blank")
                                }
                                className="text-xs"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Join Meeting
                              </Button>
                            )}
                          </div>
                        )}
                        {!isUserAttending && (
                          <p className="text-sm text-muted-foreground">
                            Link available after joining
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                {(session.type === "in-person" || session.type === "hybrid") &&
                  session.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium mb-1">Location</p>
                        <p className="text-sm text-muted-foreground">
                          {session.location}
                        </p>
                      </div>
                    </div>
                  )}

                {/* Capacity */}
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {session.currentParticipants} /{" "}
                        {session.maxParticipants} participants
                      </p>
                      {session.waitlistCount > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {session.waitlistCount} on waitlist
                        </span>
                      )}
                    </div>
                    <Progress value={capacityPercentage} className="h-2" />
                    {isFull && !isUserAttending && (
                      <p className="text-sm text-amber-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Session is full - you can join the waitlist
                      </p>
                    )}
                  </div>
                </div>

                {/* Recurring Info */}
                {session.isRecurring && session.recurrencePattern && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Recurring Session</p>
                      <p className="text-sm text-muted-foreground">
                        Repeats {session.recurrencePattern.frequency}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {session.tags.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold">Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {session.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Materials */}
            {session.materials && session.materials.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold">Session Materials</h3>
                  <div className="space-y-2">
                    {session.materials.map((material, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => window.open(material, "_blank")}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Resource {index + 1}
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Recording */}
            {isCompleted && session.recordingUrl && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold">Session Recording</h3>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(session.recordingUrl, "_blank")}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Watch Recording
                  </Button>
                </div>
              </>
            )}

            {/* Notes */}
            {session.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold">Notes</h3>
                  <p className="text-sm text-muted-foreground">
                    {session.notes}
                  </p>
                </div>
              </>
            )}

            {/* Actions */}
            {!isCancelled && !isCompleted && (
              <>
                <Separator />
                <div className="flex gap-2">
                  {isUserAttending ? (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleRSVP("leave")}
                        disabled={isRSVPing}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Leave Session
                      </Button>
                      <Button onClick={downloadICS} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Add to Calendar
                      </Button>
                    </>
                  ) : isUserWaitlisted ? (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleRSVP("leave")}
                      disabled={isRSVPing}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Leave Waitlist
                    </Button>
                  ) : (
                    <Button
                      className="flex-1"
                      onClick={() => handleRSVP("join")}
                      disabled={isRSVPing}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {isFull ? "Join Waitlist" : "Join Session"}
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
