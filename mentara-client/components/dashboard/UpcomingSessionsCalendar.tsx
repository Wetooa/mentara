"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, User, Video } from "lucide-react";
import { motion } from "framer-motion";
import { useApi } from "@/lib/api";
import type { Meeting } from "@/lib/api/services/meetings";
import { format, isSameDay, parseISO } from "date-fns";

interface UpcomingSessionsCalendarProps {
  className?: string;
}

export default function UpcomingSessionsCalendar({ className }: UpcomingSessionsCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const api = useApi();

  // Fetch upcoming meetings
  const { data: meetingsData, isLoading, error } = useQuery({
    queryKey: ['meetings', 'upcoming'],
    queryFn: () => api.meetings.getUpcomingMeetings(30), // Get next 30 meetings
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Process meetings data for calendar
  const { meetingDates, selectedDateMeetings } = useMemo(() => {
    if (!meetingsData?.meetings) {
      return { meetingDates: [], selectedDateMeetings: [] };
    }

    const meetings = meetingsData.meetings.filter(meeting => meeting.startTime);
    const dates = meetings
      .map(meeting => {
        try {
          return parseISO(meeting.startTime);
        } catch {
          return null;
        }
      })
      .filter((date): date is Date => date !== null && !isNaN(date.getTime()));
    
    const selectedMeetings = selectedDate 
      ? meetings.filter(meeting => {
          try {
            return meeting.startTime && isSameDay(parseISO(meeting.startTime), selectedDate);
          } catch {
            return false;
          }
        })
      : [];

    return {
      meetingDates: dates,
      selectedDateMeetings: selectedMeetings
    };
  }, [meetingsData, selectedDate]);

  // Custom day content to show meeting indicators
  const renderDayContent = (day: Date) => {
    const hasMeeting = meetingDates.some(meetingDate => isSameDay(meetingDate, day));
    
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span>{day.getDate()}</span>
        {hasMeeting && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
        )}
      </div>
    );
  };

  const getMeetingStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-primary text-primary-foreground';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleJoinMeeting = (meeting: Meeting) => {
    if (meeting.meetingUrl) {
      window.open(meeting.meetingUrl, '_blank');
    }
  };

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Upcoming Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Failed to load sessions calendar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Upcoming Sessions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calendar */}
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date()}
            modifiers={{
              meeting: meetingDates,
            }}
            modifiersStyles={{
              meeting: {
                fontWeight: 'bold',
                color: 'var(--primary)',
              },
            }}
            className="rounded-md border shadow-sm"
          />
        </div>

        {/* Selected Date Sessions */}
        {selectedDate && (
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h4>
            
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : selectedDateMeetings.length > 0 ? (
              <div className="space-y-3">
                {selectedDateMeetings.map((meeting, index) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-card rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {meeting.startTime ? format(parseISO(meeting.startTime), 'h:mm a') : 'Time TBD'}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={getMeetingStatusColor(meeting.status)}
                        >
                          {meeting.status.toLowerCase()}
                        </Badge>
                      </div>
                      
                      {meeting.therapist && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>
                            Dr. {meeting.therapist.user.firstName} {meeting.therapist.user.lastName}
                          </span>
                        </div>
                      )}
                      
                      {meeting.title && (
                        <p className="text-sm text-muted-foreground">{meeting.title}</p>
                      )}
                    </div>

                    {meeting.status === 'CONFIRMED' && meeting.meetingUrl && (
                      <Button
                        size="sm"
                        onClick={() => handleJoinMeeting(meeting)}
                        className="ml-3"
                      >
                        <Video className="h-4 w-4 mr-1" />
                        Join
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">
                No sessions scheduled for this date
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}