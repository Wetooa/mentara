"use client";

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

// Required for static export
export function generateStaticParams() {
  return [];
}
import { MeetingRoom } from '@/components/meeting/MeetingRoom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Video, 
  Clock, 
  Users, 
  ArrowLeft, 
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle 
} from 'lucide-react';
import { useApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format, isAfter, isBefore, addMinutes, subMinutes } from 'date-fns';

interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  therapist: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  videoRoomUrl?: string;
  meetingNotes?: string;
}

interface ClientMeetingPageProps {
  params: Promise<{ id: string }>;
}

export default function ClientMeetingPage({ params }: ClientMeetingPageProps) {
  const { id: meetingId } = use(params);
  const router = useRouter();
  const api = useApi();
  const { user } = useAuth();

  const [accessGranted, setAccessGranted] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Fetch meeting details
  const {
    data: meeting,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: () => api.meetings.getById(meetingId),
    enabled: !!meetingId,
    refetchInterval: 30000, // Refetch every 30 seconds to check status
  });

  // Check if user has access to this meeting
  useEffect(() => {
    if (meeting && user) {
      const hasAccess = meeting.client.id === user.id || meeting.therapist.id === user.id;
      setAccessGranted(hasAccess);
      
      if (!hasAccess) {
        toast.error('You do not have permission to access this meeting');
      }
    }
  }, [meeting, user]);

  const handleLeave = () => {
    router.push('/client/dashboard');
  };

  const handleJoinMeeting = async () => {
    if (!meeting) return;
    
    setIsJoining(true);
    try {
      // Create or join video room
      await api.meetings.joinVideoRoom(meetingId);
      toast.success('Joined meeting successfully');
    } catch (error) {
      toast.error('Failed to join meeting');
      console.error('Failed to join meeting:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const getMeetingStatus = () => {
    if (!meeting) return null;

    const now = new Date();
    const startTime = new Date(meeting.startTime);
    const endTime = new Date(meeting.endTime);
    const gracePeriod = 15; // 15 minutes grace period

    if (meeting.status === 'CANCELLED') {
      return { type: 'cancelled', message: 'This meeting has been cancelled' };
    }

    if (meeting.status === 'COMPLETED') {
      return { type: 'completed', message: 'This meeting has ended' };
    }

    if (isBefore(now, subMinutes(startTime, gracePeriod))) {
      return { 
        type: 'early', 
        message: `Meeting starts at ${format(startTime, 'h:mm a')}`,
        canJoin: false
      };
    }

    if (isAfter(now, addMinutes(endTime, gracePeriod))) {
      return { 
        type: 'late', 
        message: 'This meeting has ended',
        canJoin: false
      };
    }

    if (meeting.status === 'IN_PROGRESS') {
      return { 
        type: 'active', 
        message: 'Meeting is in progress',
        canJoin: true
      };
    }

    return { 
      type: 'ready', 
      message: 'Ready to join meeting',
      canJoin: true
    };
  };

  const status = getMeetingStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/client/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error ? 'Failed to load meeting details' : 'Meeting not found'}
            </AlertDescription>
          </Alert>

          <div className="mt-4">
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!accessGranted) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/client/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              You do not have permission to access this meeting.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // If meeting is active and user can join, show the meeting room directly
  if (status?.type === 'active' && status?.canJoin) {
    return (
      <div className="min-h-screen bg-gray-900">
        <MeetingRoom 
          meetingId={meetingId} 
          onLeave={handleLeave}
        />
      </div>
    );
  }

  // Otherwise show the meeting lobby/waiting room
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/client/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Video className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{meeting.title}</h1>
              <p className="text-muted-foreground">
                Therapy session with Dr. {meeting.therapist.lastName}
              </p>
            </div>
          </div>
        </div>

        {/* Meeting Status Alert */}
        {status && (
          <Alert className={`mb-6 ${
            status.type === 'cancelled' || status.type === 'late' 
              ? 'border-red-200 bg-red-50' 
              : status.type === 'active' 
              ? 'border-green-200 bg-green-50'
              : status.type === 'ready'
              ? 'border-blue-200 bg-blue-50'
              : 'border-yellow-200 bg-yellow-50'
          }`}>
            {status.type === 'cancelled' || status.type === 'late' ? (
              <XCircle className="h-4 w-4" />
            ) : status.type === 'active' || status.type === 'ready' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            <AlertDescription className="font-medium">
              {status.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Meeting Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Meeting Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Schedule</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Date:</span>{' '}
                      {format(new Date(meeting.startTime), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p>
                      <span className="font-medium">Time:</span>{' '}
                      {format(new Date(meeting.startTime), 'h:mm a')} -{' '}
                      {format(new Date(meeting.endTime), 'h:mm a')}
                    </p>
                    <p>
                      <span className="font-medium">Duration:</span>{' '}
                      {Math.round((new Date(meeting.endTime).getTime() - new Date(meeting.startTime).getTime()) / (1000 * 60))} minutes
                    </p>
                  </div>
                </div>

                {meeting.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{meeting.description}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Status</h4>
                  <Badge variant={
                    meeting.status === 'SCHEDULED' ? 'secondary' :
                    meeting.status === 'IN_PROGRESS' ? 'default' :
                    meeting.status === 'COMPLETED' ? 'outline' :
                    'destructive'
                  }>
                    {meeting.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Meeting Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participants
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Therapist */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {meeting.therapist.firstName[0]}{meeting.therapist.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">
                      Dr. {meeting.therapist.firstName} {meeting.therapist.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">Therapist</p>
                  </div>
                </div>

                {/* Client */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-600">
                      {meeting.client.firstName[0]}{meeting.client.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">
                      {meeting.client.firstName} {meeting.client.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">Client (You)</p>
                  </div>
                </div>

                {/* Join Button */}
                <div className="pt-4 space-y-2">
                  <Button
                    onClick={handleJoinMeeting}
                    disabled={!status?.canJoin || isJoining}
                    className="w-full"
                    size="lg"
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <Video className="h-4 w-4 mr-2" />
                        Join Meeting
                      </>
                    )}
                  </Button>
                  
                  {!status?.canJoin && (
                    <p className="text-xs text-muted-foreground text-center">
                      {status?.type === 'early' ? 'Meeting will be available 15 minutes before start time' : 
                       status?.type === 'late' ? 'Meeting has ended' : 
                       'Meeting is not available'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Technical Requirements */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Technical Requirements</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <p>• Camera and microphone access required</p>
                <p>• Stable internet connection recommended</p>
                <p>• Chrome, Firefox, or Safari browser</p>
                <p>• Enable notifications for session updates</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}