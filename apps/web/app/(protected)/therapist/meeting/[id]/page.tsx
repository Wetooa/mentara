"use client";

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { MeetingRoom } from '@/components/meeting/MeetingRoom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { 
  Video, 
  Clock, 
  Users, 
  ArrowLeft, 
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  FileText,
  Save,
  Play,
  Square 
} from 'lucide-react';
import { useApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

interface TherapistMeetingPageProps {
  params: Promise<{ id: string }>;
}

export default function TherapistMeetingPage({ params }: TherapistMeetingPageProps) {
  const { id: meetingId } = use(params);
  const router = useRouter();
  const api = useApi();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [accessGranted, setAccessGranted] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

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

  // Initialize notes when meeting loads
  useEffect(() => {
    if (meeting?.meetingNotes) {
      setMeetingNotes(meeting.meetingNotes);
    }
  }, [meeting?.meetingNotes]);

  // Check if user has access to this meeting
  useEffect(() => {
    if (meeting && user) {
      const hasAccess = meeting.therapist.id === user.id;
      setAccessGranted(hasAccess);
      
      if (!hasAccess) {
        toast.error('You do not have permission to access this meeting');
      }
    }
  }, [meeting, user]);

  // Save notes mutation
  const saveNotesMutation = useMutation({
    mutationFn: (notes: string) => api.meetings.saveNotes(meetingId, notes),
    onSuccess: () => {
      toast.success('Notes saved successfully');
      queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] });
    },
    onError: () => {
      toast.error('Failed to save notes');
    },
  });

  // Start meeting mutation
  const startMeetingMutation = useMutation({
    mutationFn: () => api.meetings.start(meetingId),
    onSuccess: () => {
      toast.success('Meeting started');
      queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] });
    },
    onError: () => {
      toast.error('Failed to start meeting');
    },
  });

  // End meeting mutation
  const endMeetingMutation = useMutation({
    mutationFn: () => api.meetings.end(meetingId),
    onSuccess: () => {
      toast.success('Meeting ended');
      queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] });
      setShowNotes(true);
    },
    onError: () => {
      toast.error('Failed to end meeting');
    },
  });

  const handleLeave = () => {
    router.push('/therapist/dashboard');
  };

  const handleStartMeeting = async () => {
    if (!meeting) return;
    
    setIsStarting(true);
    try {
      await startMeetingMutation.mutateAsync();
      await api.meetings.createVideoRoom(meetingId);
      toast.success('Meeting started successfully');
    } catch (error) {
      toast.error('Failed to start meeting');
      console.error('Failed to start meeting:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleJoinMeeting = async () => {
    if (!meeting) return;
    
    setIsJoining(true);
    try {
      await api.meetings.joinVideoRoom(meetingId);
      toast.success('Joined meeting successfully');
    } catch (error) {
      toast.error('Failed to join meeting');
      console.error('Failed to join meeting:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleEndMeeting = async () => {
    if (!meeting) return;
    
    setIsEnding(true);
    try {
      await endMeetingMutation.mutateAsync();
      await api.meetings.endVideoRoom(meetingId);
      toast.success('Meeting ended successfully');
    } catch (error) {
      toast.error('Failed to end meeting');
      console.error('Failed to end meeting:', error);
    } finally {
      setIsEnding(false);
    }
  };

  const handleSaveNotes = () => {
    saveNotesMutation.mutate(meetingNotes);
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
        canStart: false,
        canJoin: false
      };
    }

    if (isAfter(now, addMinutes(endTime, gracePeriod))) {
      return { 
        type: 'late', 
        message: 'This meeting should have ended',
        canStart: false,
        canJoin: false
      };
    }

    if (meeting.status === 'IN_PROGRESS') {
      return { 
        type: 'active', 
        message: 'Meeting is in progress',
        canStart: false,
        canJoin: true,
        canEnd: true
      };
    }

    return { 
      type: 'ready', 
      message: 'Ready to start meeting',
      canStart: true,
      canJoin: false
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
              onClick={() => router.push('/therapist/dashboard')}
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
              onClick={() => router.push('/therapist/dashboard')}
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
  if (status?.type === 'active' && status?.canJoin && !showNotes) {
    return (
      <div className="min-h-screen bg-gray-900">
        <MeetingRoom 
          meetingId={meetingId} 
          onLeave={handleLeave}
        />
        
        {/* End Meeting Button (floating) */}
        <div className="fixed bottom-4 right-4">
          <Button
            onClick={handleEndMeeting}
            disabled={isEnding}
            variant="destructive"
            size="lg"
          >
            {isEnding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Ending...
              </>
            ) : (
              <>
                <Square className="h-4 w-4 mr-2" />
                End Meeting
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Show notes page after meeting ends
  if (status?.type === 'completed' || showNotes) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/therapist/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Session Notes</h1>
                <p className="text-muted-foreground">
                  {meeting.client.firstName} {meeting.client.lastName} - {format(new Date(meeting.startTime), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Meeting Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your session notes here..."
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                rows={12}
                className="resize-none"
              />
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveNotes}
                  disabled={saveNotesMutation.isPending}
                >
                  {saveNotesMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Notes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Otherwise show the meeting lobby/waiting room with therapist controls
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/therapist/dashboard')}
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
                Session with {meeting.client.firstName} {meeting.client.lastName}
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
                  Session Details
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
                    <h4 className="font-medium mb-2">Session Notes</h4>
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
                    <p className="text-sm text-muted-foreground">Therapist (You)</p>
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
                    <p className="text-sm text-muted-foreground">Client</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 space-y-2">
                  {status?.canStart && (
                    <Button
                      onClick={handleStartMeeting}
                      disabled={isStarting}
                      className="w-full"
                      size="lg"
                    >
                      {isStarting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start Meeting
                        </>
                      )}
                    </Button>
                  )}
                  
                  {status?.canJoin && (
                    <Button
                      onClick={handleJoinMeeting}
                      disabled={isJoining}
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
                  )}

                  {status?.canEnd && (
                    <Button
                      onClick={handleEndMeeting}
                      disabled={isEnding}
                      variant="destructive"
                      className="w-full"
                      size="lg"
                    >
                      {isEnding ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Ending...
                        </>
                      ) : (
                        <>
                          <Square className="h-4 w-4 mr-2" />
                          End Meeting
                        </>
                      )}
                    </Button>
                  )}
                  
                  {(!status?.canStart && !status?.canJoin) && (
                    <p className="text-xs text-muted-foreground text-center">
                      {status?.type === 'early' ? 'Meeting will be available 15 minutes before start time' : 
                       status?.type === 'late' ? 'Meeting time has passed' : 
                       'Meeting is not available'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Session Notes Preview */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Session Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Quick notes about the session..."
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  rows={4}
                  className="text-sm resize-none"
                />
                <div className="mt-2 flex justify-end">
                  <Button 
                    onClick={handleSaveNotes}
                    disabled={saveNotesMutation.isPending}
                    size="sm"
                    variant="outline"
                  >
                    {saveNotesMutation.isPending ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Save className="h-3 w-3 mr-1" />
                    )}
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}