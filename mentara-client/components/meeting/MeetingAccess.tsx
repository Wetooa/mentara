"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  Clock, 
  Calendar,
  User,
  ArrowRight,
  Play,
  CheckCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format, isAfter, isBefore, addMinutes, subMinutes } from 'date-fns';

interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  therapist?: {
    firstName: string;
    lastName: string;
  };
  client?: {
    firstName: string;
    lastName: string;
  };
}

interface MeetingAccessProps {
  meetings: Meeting[];
  userRole: 'client' | 'therapist';
  isLoading?: boolean;
}

export function MeetingAccess({ meetings, userRole, isLoading }: MeetingAccessProps) {
  const router = useRouter();

  const getMeetingStatus = (meeting: Meeting) => {
    const now = new Date();
    const startTime = new Date(meeting.startTime);
    const endTime = new Date(meeting.endTime);
    const gracePeriod = 15; // 15 minutes

    if (meeting.status === 'CANCELLED') {
      return { type: 'cancelled', canJoin: false, message: 'Cancelled' };
    }

    if (meeting.status === 'COMPLETED') {
      return { type: 'completed', canJoin: false, message: 'Completed' };
    }

    if (isBefore(now, subMinutes(startTime, gracePeriod))) {
      return { 
        type: 'upcoming', 
        canJoin: false, 
        message: `Starts at ${format(startTime, 'h:mm a')}` 
      };
    }

    if (isAfter(now, addMinutes(endTime, gracePeriod))) {
      return { 
        type: 'past', 
        canJoin: false, 
        message: 'Session ended' 
      };
    }

    if (meeting.status === 'IN_PROGRESS') {
      return { 
        type: 'active', 
        canJoin: true, 
        message: 'In progress' 
      };
    }

    return { 
      type: 'ready', 
      canJoin: true, 
      message: 'Ready to join' 
    };
  };

  const handleJoinMeeting = (meetingId: string) => {
    router.push(`/${userRole}/meeting/${meetingId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!meetings || meetings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-muted-foreground">No upcoming video sessions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Video Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {meetings.map((meeting) => {
            const status = getMeetingStatus(meeting);
            const otherParticipant = userRole === 'client' ? meeting.therapist : meeting.client;

            return (
              <div
                key={meeting.id}
                className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                  status.canJoin ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    status.type === 'active' ? 'bg-green-100' :
                    status.type === 'ready' ? 'bg-blue-100' :
                    status.type === 'upcoming' ? 'bg-yellow-100' :
                    'bg-gray-100'
                  }`}>
                    {status.type === 'active' ? (
                      <Play className="h-5 w-5 text-green-600" />
                    ) : status.type === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-gray-600" />
                    ) : (
                      <Video className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium">{meeting.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(meeting.startTime), 'MMM d')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(meeting.startTime), 'h:mm a')}
                      </div>
                      {otherParticipant && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {userRole === 'client' 
                            ? `Dr. ${otherParticipant.lastName}`
                            : `${otherParticipant.firstName} ${otherParticipant.lastName}`
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={
                    status.type === 'active' ? 'default' :
                    status.type === 'ready' ? 'secondary' :
                    status.type === 'upcoming' ? 'outline' :
                    'outline'
                  }>
                    {status.message}
                  </Badge>
                  
                  {status.canJoin && (
                    <Button
                      onClick={() => handleJoinMeeting(meeting.id)}
                      size="sm"
                      className={`${
                        status.type === 'active' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : ''
                      }`}
                    >
                      {status.type === 'active' ? 'Join' : 'Enter'}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}