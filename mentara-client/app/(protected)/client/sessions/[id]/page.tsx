"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Video, 
  MessageCircle,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  MapPin,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useSessionById } from "@/hooks/sessions";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'SCHEDULED':
      return {
        label: 'Scheduled',
        color: 'bg-blue-100 text-blue-800',
        icon: Calendar
      };
    case 'CONFIRMED':
      return {
        label: 'Confirmed',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle
      };
    case 'IN_PROGRESS':
      return {
        label: 'In Progress',
        color: 'bg-purple-100 text-purple-800',
        icon: Video
      };
    case 'COMPLETED':
      return {
        label: 'Completed',
        color: 'bg-gray-100 text-gray-800',
        icon: CheckCircle
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        color: 'bg-red-100 text-red-800',
        icon: XCircle
      };
    case 'NO_SHOW':
      return {
        label: 'No Show',
        color: 'bg-orange-100 text-orange-800',
        icon: AlertCircle
      };
    default:
      return {
        label: status,
        color: 'bg-gray-100 text-gray-800',
        icon: Calendar
      };
  }
};

interface SessionDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function SessionDetailsPage({ params }: SessionDetailsPageProps) {
  const router = useRouter();
  const { id: sessionId } = use(params);

  const { 
    data: session, 
    isLoading, 
    error, 
    refetch,
    isRefetching
  } = useSessionById(sessionId);

  const handleBackToSessions = () => {
    router.push('/client/sessions');
  };

  const handleJoinSession = () => {
    // This would integrate with video calling system
    console.log('Joining session:', sessionId);
  };

  const handleRescheduleSession = () => {
    router.push(`/client/booking/reschedule/${sessionId}`);
  };

  const handleCancelSession = () => {
    // This would open a confirmation dialog
    console.log('Cancelling session:', sessionId);
  };

  const handleMessageTherapist = () => {
    if (session?.therapistId) {
      router.push(`/client/messages?contact=${session.therapistId}`);
    }
  };

  const handleRetry = () => {
    refetch();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-full p-6 space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-32" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-full p-6 space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToSessions}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sessions
          </Button>
        </div>
        <Alert className="max-w-md mx-auto border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load session details</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isRefetching}
              className="ml-4"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="w-full h-full p-6 space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToSessions}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sessions
          </Button>
        </div>
        <Alert className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Session not found. It may have been deleted or you don&apos;t have permission to view it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const statusConfig = getStatusConfig(session.status);
  const StatusIcon = statusConfig.icon;
  const isUpcoming = session.status === 'SCHEDULED' || session.status === 'CONFIRMED';
  const isCompleted = session.status === 'COMPLETED';
  const isInProgress = session.status === 'IN_PROGRESS';
  const isCancelled = session.status === 'CANCELLED' || session.status === 'NO_SHOW';

  return (
    <motion.div
      className="w-full h-full p-6 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
        variants={itemVariants}
      >
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToSessions}
            className="gap-2 mt-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sessions
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">Session Details</h1>
              <Badge className={statusConfig.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {session.dateTime 
                ? `${format(new Date(session.dateTime), "EEEE, MMMM d, yyyy")} at ${format(new Date(session.dateTime), "h:mm a")}`
                : "Date not available"
              }
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isUpcoming && (
            <>
              <Button onClick={handleJoinSession} className="gap-2">
                <Video className="h-4 w-4" />
                Join Session
              </Button>
              <Button variant="outline" onClick={handleRescheduleSession}>
                <Edit className="h-4 w-4 mr-2" />
                Reschedule
              </Button>
              <Button variant="outline" onClick={handleCancelSession} className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
          {isInProgress && (
            <Button onClick={handleJoinSession} className="gap-2">
              <Video className="h-4 w-4" />
              Join Session
            </Button>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session Information */}
        <motion.div className="lg:col-span-2 space-y-6" variants={itemVariants}>
          {/* Session Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Session Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Duration</div>
                    <div className="text-sm text-muted-foreground">{session.duration} minutes</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Type</div>
                    <div className="text-sm text-muted-foreground">{session.meetingType || 'Video Session'}</div>
                  </div>
                </div>
              </div>

              {/* Meeting URL Display */}
              {session.meetingUrl && (
                <div className="col-span-2">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2">
                      {session.meetingUrl.includes('http') ? (
                        <Video className="h-4 w-4 text-blue-600 mt-0.5" />
                      ) : (
                        <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          {session.meetingUrl.includes('http') ? 'Video Meeting Link' : 'Meeting Location'}
                        </p>
                        <p className="text-sm text-blue-800 break-all">
                          {session.meetingUrl}
                        </p>
                        {session.meetingUrl.includes('http') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(session.meetingUrl, '_blank');
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800 underline mt-1 flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Join Meeting
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {session.notes && (
                <>
                  <Separator />
                  <div>
                    <div className="font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Session Notes
                    </div>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                      {session.notes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Session Status Information */}
          {(isCompleted || isCancelled) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StatusIcon className="h-5 w-5" />
                  Session Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isCompleted && (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      This session was completed successfully. Great work on your mental health journey!
                    </div>
                    {session.feedback && (
                      <div className="bg-green-50 p-3 rounded-md">
                        <div className="font-medium text-green-800 mb-1">Session Feedback</div>
                        <p className="text-sm text-green-700">{session.feedback}</p>
                      </div>
                    )}
                  </div>
                )}
                {isCancelled && (
                  <div className="text-sm text-muted-foreground">
                    This session was cancelled. You can schedule a new session or reschedule for a different time.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Therapist Information & Actions */}
        <motion.div className="space-y-6" variants={itemVariants}>
          {/* Therapist Card */}
          {session.therapist && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Therapist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{session.therapist.name}</div>
                    <div className="text-sm text-muted-foreground">{session.therapist.specialization}</div>
                    {session.therapist.experience && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {session.therapist.experience} years experience
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMessageTherapist}
                    className="gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/client/therapist')}
                    className="gap-2"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => router.push('/client/booking')}
              >
                <Calendar className="h-4 w-4" />
                Schedule Another Session
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => router.push('/client/worksheets')}
              >
                <FileText className="h-4 w-4" />
                View Worksheets
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => router.push('/client/sessions')}
              >
                <Calendar className="h-4 w-4" />
                All Sessions
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}