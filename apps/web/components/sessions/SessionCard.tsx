import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, User, Video, Phone, MapPin, ExternalLink } from "lucide-react";
import { format, parseISO, isToday, isTomorrow, isYesterday } from "date-fns";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Meeting } from "@/lib/api/services/meetings";

interface SessionCardProps {
  session: Meeting;
  onClick?: () => void;
  showJoinButton?: boolean;
  showTherapistInfo?: boolean;
  showClientInfo?: boolean;
  variant?: 'default' | 'compact';
}

const cardVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

const getStatusColor = (status: Meeting["status"]) => {
  switch (status) {
    case 'SCHEDULED':
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'IN_PROGRESS':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'COMPLETED':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'NO_SHOW':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusText = (status: Meeting["status"]) => {
  switch (status) {
    case 'SCHEDULED':
      return 'Scheduled';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    case 'NO_SHOW':
      return 'No Show';
    default:
      return status;
  }
};

const formatDate = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d, yyyy');
    }
  } catch (error) {
    return 'Invalid date';
  }
};

const formatTime = (dateString: string) => {
  try {
    return format(parseISO(dateString), 'h:mm a');
  } catch (error) {
    return 'Invalid time';
  }
};

export function SessionCard({
  session,
  onClick,
  showJoinButton = false,
  showTherapistInfo = true,
  showClientInfo = false,
  variant = 'default'
}: SessionCardProps) {
  const router = useRouter();
  const therapistName = session.therapist 
    ? `${session.therapist.user.firstName} ${session.therapist.user.lastName}`
    : 'Unknown Therapist';
    
  const clientName = session.client
    ? `${session.client.user.firstName} ${session.client.user.lastName}`
    : 'Unknown Client';

  // Check if meeting URL is internal (WebRTC meeting room)
  const isInternalMeetingUrl = session.meetingUrl?.includes('/meeting/');
  const isInPersonMeeting = session.meetingUrl && !isInternalMeetingUrl && !session.meetingUrl.includes('http');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const canJoin = session.status === 'CONFIRMED' || session.status === 'IN_PROGRESS';

  if (variant === 'compact') {
    return (
      <motion.div variants={cardVariants}>
        <Card 
          className={`cursor-pointer hover:shadow-md transition-all duration-200 ${
            onClick ? 'hover:ring-2 hover:ring-primary/20' : ''
          }`}
          onClick={onClick}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {showTherapistInfo && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.therapist?.user?.profilePicture} />
                    <AvatarFallback className="text-xs bg-primary/10">
                      {getInitials(therapistName)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">
                    {session.title || `Session with ${showClientInfo ? clientName : therapistName}`}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(session.startTime)} at {formatTime(session.startTime)}</span>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className={`text-xs ${getStatusColor(session.status)}`}>
                {getStatusText(session.status)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={cardVariants}>
      <Card 
        className={`overflow-hidden hover:shadow-lg transition-all duration-300 ${
          onClick ? 'cursor-pointer hover:ring-2 hover:ring-primary/20' : ''
        } ${session.status === 'IN_PROGRESS' ? 'ring-2 ring-green-200 bg-green-50/50' : ''}`}
        onClick={onClick}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {(showTherapistInfo || showClientInfo) && (
                <Avatar className="h-12 w-12">
                  <AvatarImage 
                    src={showClientInfo 
                      ? session.client?.user?.profilePicture 
                      : session.therapist?.user?.profilePicture
                    } 
                  />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(showClientInfo ? clientName : therapistName)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <h3 className="font-semibold text-lg">
                  {session.title || `Session with ${showClientInfo ? clientName : therapistName}`}
                </h3>
                {showTherapistInfo && (
                  <p className="text-muted-foreground">{therapistName}</p>
                )}
                {showClientInfo && (
                  <p className="text-muted-foreground">{clientName}</p>
                )}
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={`${getStatusColor(session.status)} border`}
            >
              {getStatusText(session.status)}
            </Badge>
          </div>

          {session.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {session.description}
            </p>
          )}

          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(session.startTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                {formatTime(session.startTime)} - {formatTime(session.endTime || session.startTime)}
                {session.duration && ` (${session.duration}min)`}
              </span>
            </div>
          </div>

          {session.meetingUrl && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
              <div className="flex items-start gap-2">
                {isInternalMeetingUrl ? (
                  <Video className="h-4 w-4 text-blue-600 mt-0.5" />
                ) : isInPersonMeeting ? (
                  <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                ) : (
                  <Video className="h-4 w-4 text-blue-600 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-blue-900 mb-1">
                    {isInternalMeetingUrl ? 'Video Meeting' : isInPersonMeeting ? 'Meeting Location' : 'Video Meeting Link'}
                  </p>
                  {isInPersonMeeting ? (
                    <p className="text-xs text-blue-800 break-all">
                      {session.meetingUrl}
                    </p>
                  ) : (
                    <p className="text-xs text-blue-800 break-all">
                      {isInternalMeetingUrl ? 'Join meeting room' : session.meetingUrl}
                    </p>
                  )}
                  {isInternalMeetingUrl && canJoin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const meetingId = session.id;
                        router.push(`/meeting/${meetingId}`);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 flex items-center gap-1"
                    >
                      Join Meeting
                    </button>
                  )}
                  {!isInternalMeetingUrl && session.meetingUrl.includes('http') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(session.meetingUrl, '_blank');
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open Meeting
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {session.meetingType === 'video' ? (
                <Video className="h-4 w-4 text-blue-500" />
              ) : (
                <Phone className="h-4 w-4 text-green-500" />
              )}
              <span className="text-sm text-muted-foreground capitalize">
                {session.meetingType || 'Video'} Session
              </span>
            </div>

            {showJoinButton && canJoin && (
              <Button size="sm" className="gap-2">
                <Video className="h-4 w-4" />
                Join Session
              </Button>
            )}
            
            {session.status === 'SCHEDULED' && !showJoinButton && (
              <Button variant="outline" size="sm">
                View Details
              </Button>
            )}

            {session.status === 'COMPLETED' && (
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                View Summary
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}