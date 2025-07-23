"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnhancedCalendar } from "@/components/ui/enhanced-calendar";
import { useCalendarMeetings } from "@/hooks/calendar/useCalendarMeetings";
import { CalendarDays, ArrowRight, RefreshCw } from "lucide-react";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import { useRouter } from "next/navigation";

interface UpcomingSessionsCalendarProps {
  className?: string;
}

export default function UpcomingSessionsCalendar({ className }: UpcomingSessionsCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const router = useRouter();
  
  // Use the working calendar meetings hook that gets all sessions
  const { meetings, isLoading, error, refetch } = useCalendarMeetings({
    limit: 100 // Get more meetings to show past and future
  });
  
  // Get today's sessions for quick stats
  const todaysSessions = meetings.filter(meeting => 
    isToday(new Date(meeting.startTime))
  );
  
  const formatRelativeDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Navigate to sessions page with the selected date for detailed view
    router.push(`/client/sessions?date=${date.toISOString().split('T')[0]}`);
  };
  
  const handleViewAllSessions = () => {
    router.push('/client/sessions');
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-6">
          <div className="text-center">
            <div className="text-sm text-destructive mb-2">Failed to load calendar</div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarDays className="h-4 w-4" />
          Sessions Calendar
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleViewAllSessions}
          className="text-xs"
        >
          View All
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">Today:</span>
            <span className="font-medium">{todaysSessions.length}</span>
          </div>
          {isLoading && (
            <div className="text-muted-foreground text-xs">Loading...</div>
          )}
        </div>
        
        {/* Enhanced Calendar with meeting indicators */}
        <div className="flex justify-center">
          <EnhancedCalendar
            meetings={meetings}
            onDateSelect={handleDateSelect}
            selected={selectedDate}
            hoverDelay={1000} // Fast hover for dashboard
            className="border-0 p-2"
            showMeetingIndicators={true}
          />
        </div>
        
        {/* No sessions state */}
        {!isLoading && meetings.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>No sessions scheduled</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}