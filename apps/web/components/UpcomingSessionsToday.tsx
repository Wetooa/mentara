"use client";

import * as React from "react";
import { format, parseISO, isToday, addMinutes } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Clock,
  User,
  Video,
  Play,
  Phone,
  MessageSquare,
  MoreVertical,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { useApi } from "@/lib/api";
import { toast } from "sonner";

interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  meetingUrl?: string;
  notes?: string;
  client: {
    userId: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      profilePicture?: string;
    };
  };
}

interface UpcomingSessionsTodayProps {
  meetings?: Meeting[];
  onMeetingUpdate?: (meeting: Meeting) => void;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

export function UpcomingSessionsToday({
  meetings = [],
  onMeetingUpdate,
  className,
}: UpcomingSessionsTodayProps) {
  const api = useApi();
  const [startingMeeting, setStartingMeeting] = React.useState<string | null>(null);
  const [cancellingMeeting, setCancellingMeeting] = React.useState<string | null>(null);

  // Filter meetings for today only
  const todayMeetings = React.useMemo(() => {
    return meetings.filter((meeting) => {
      try {
        return isToday(parseISO(meeting.startTime));
      } catch {
        return false;
      }
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [meetings]);

  const handleStartMeeting = async (meeting: Meeting) => {
    try {
      setStartingMeeting(meeting.id);
      await api.meetings.start(meeting.id);
      
      const updatedMeeting = { ...meeting, status: "IN_PROGRESS" };
      onMeetingUpdate?.(updatedMeeting);
      
      toast.success("Meeting started successfully");
    } catch (error) {
      logger.error("Failed to start meeting:", error);
      toast.error("Failed to start meeting");
    } finally {
      setStartingMeeting(null);
    }
  };

  const handleJoinVideo = async (meeting: Meeting) => {
    try {
      if (meeting.meetingUrl) {
        window.open(meeting.meetingUrl, "_blank");
      } else {
        // Create video room if it doesn't exist
        const videoRoom = await api.meetings.createVideoRoom(meeting.id);
        if (videoRoom.roomUrl) {
          window.open(videoRoom.roomUrl, "_blank");
        }
      }
    } catch (error) {
      logger.error("Failed to join video call:", error);
      toast.error("Failed to join video call");
    }
  };

  const handleCancelMeeting = async (meeting: Meeting) => {
    try {
      setCancellingMeeting(meeting.id);
      await api.meetings.cancel(meeting.id);
      
      const updatedMeeting = { ...meeting, status: "CANCELLED" };
      onMeetingUpdate?.(updatedMeeting);
      
      toast.success("Meeting cancelled successfully");
    } catch (error) {
      logger.error("Failed to cancel meeting:", error);
      toast.error("Failed to cancel meeting");
    } finally {
      setCancellingMeeting(null);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "h:mm a");
    } catch {
      return "Invalid time";
    }
  };

  const getTimeUntilMeeting = (startTime: string) => {
    try {
      const meetingTime = parseISO(startTime);
      const now = new Date();
      const diffMinutes = Math.floor((meetingTime.getTime() - now.getTime()) / (1000 * 60));
      
      if (diffMinutes < 0) return "Started";
      if (diffMinutes === 0) return "Starting now";
      if (diffMinutes < 60) return `in ${diffMinutes}m`;
      
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `in ${hours}h ${minutes}m`;
    } catch {
      return "Invalid time";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CONFIRMED":
        return "bg-green-100 text-green-800 border-green-200";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const canStartMeeting = (meeting: Meeting) => {
    const status = meeting.status?.toUpperCase();
    return status === "SCHEDULED" || status === "CONFIRMED";
  };

  const isSessionLive = (meeting: Meeting) => {
    try {
      const now = new Date();
      const startTime = parseISO(meeting.startTime);
      const endTime = addMinutes(startTime, meeting.duration);
      return now >= startTime && now <= endTime && meeting.status === "IN_PROGRESS";
    } catch {
      return false;
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  if (todayMeetings.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Sessions Today
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              You don't have any sessions scheduled for today. Enjoy your day off!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={className}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Sessions
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {todayMeetings.length} session{todayMeetings.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {todayMeetings.map((meeting, index) => (
            <motion.div
              key={meeting.id}
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              className={`p-4 border rounded-lg transition-all duration-200 ${
                isSessionLive(meeting)
                  ? "border-green-200 bg-green-50"
                  : "hover:shadow-md border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Client Info & Meeting Details */}
                <div className="flex-1 space-y-3">
                  {/* Client Info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={meeting.client.user.profilePicture}
                        alt={`${meeting.client.user.firstName} ${meeting.client.user.lastName}`}
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {getInitials(meeting.client.user.firstName, meeting.client.user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">
                          {meeting.client.user.firstName} {meeting.client.user.lastName}
                        </h3>
                        {isSessionLive(meeting) && (
                          <motion.span
                            className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            Live
                          </motion.span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {meeting.title || "Therapy Session"}
                      </p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(meeting.status)}>
                      {meeting.status?.toLowerCase().replace("_", " ")}
                    </Badge>
                  </div>

                  {/* Meeting Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {getTimeUntilMeeting(meeting.startTime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{meeting.duration} minutes</p>
                        <p className="text-xs text-gray-600">Session duration</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {meeting.meetingUrl ? "Video Ready" : "Audio Call"}
                        </p>
                        <p className="text-xs text-gray-600">Meeting type</p>
                      </div>
                    </div>
                  </div>

                  {/* Notes if any */}
                  {meeting.notes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Notes:</strong> {meeting.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 min-w-[140px]">
                  {/* Primary Action Button */}
                  {canStartMeeting(meeting) ? (
                    <Button
                      onClick={() => handleStartMeeting(meeting)}
                      disabled={startingMeeting === meeting.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {startingMeeting === meeting.id ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-white" />
                          <span>Starting...</span>
                        </div>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Start Meeting
                        </>
                      )}
                    </Button>
                  ) : isSessionLive(meeting) ? (
                    <Button
                      onClick={() => handleJoinVideo(meeting)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      <Video className="h-4 w-4 mr-1" />
                      Join Video
                    </Button>
                  ) : (
                    <Button variant="outline" disabled>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {meeting.status === "COMPLETED" ? "Completed" : "Cancelled"}
                    </Button>
                  )}

                  {/* Secondary Actions */}
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          View Notes
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <User className="h-4 w-4 mr-2" />
                          Client Profile
                        </DropdownMenuItem>
                        <Separator className="my-1" />
                        {canStartMeeting(meeting) && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel Meeting
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <AlertTriangle className="h-5 w-5 text-red-500" />
                                  Cancel Meeting
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel this session with{" "}
                                  {meeting.client.user.firstName} {meeting.client.user.lastName}?
                                  This action cannot be undone and the client will be notified.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep Meeting</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCancelMeeting(meeting)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {cancellingMeeting === meeting.id ? (
                                    <div className="flex items-center gap-2">
                                      <div className="animate-spin rounded-full h-3 w-3 border-b border-white" />
                                      <span>Cancelling...</span>
                                    </div>
                                  ) : (
                                    <>
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Cancel Meeting
                                    </>
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}