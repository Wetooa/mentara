"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppointmentCalendar from "@/components/calendar-02";
import { useCalendarMeetings } from "@/hooks/calendar/useCalendarMeetings";
import { CalendarDays, ArrowRight, RefreshCw, Maximize2 } from "lucide-react";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import { useRouter } from "next/navigation";
import { CalendarModal } from "@/components/calendar/CalendarModal";

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
  
  // Get today's sessions for quick stats with error handling
  const todaysSessions = meetings.filter(meeting => {
    try {
      return meeting.startTime && isToday(new Date(meeting.startTime));
    } catch {
      return false;
    }
  });
  
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
    <div className={`space-y-4 ${className}`}>
      {/* Modern Header with Stats - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-teal-600" />
            <h2 className="text-xl font-semibold text-gray-900">Sessions Calendar</h2>
          </div>
          <div className="flex items-center gap-2 bg-teal-50 px-3 py-1.5 rounded-full self-start">
            <div className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="text-sm text-teal-700 font-medium">Today: {todaysSessions.length}</span>
          </div>
          {isLoading && (
            <div className="text-teal-600 text-sm flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
              Loading...
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <CalendarModal
            trigger={
              <Button variant="outline" size="sm" className="text-sm hover:bg-teal-50 hover:border-teal-200">
                <Maximize2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Full View</span>
                <span className="sm:hidden">Full</span>
              </Button>
            }
          />
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleViewAllSessions}
            className="text-sm hover:bg-teal-50 hover:border-teal-200"
          >
            <span className="hidden sm:inline">View All</span>
            <span className="sm:hidden">All</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
      
      {/* Full-Width Appointment Calendar */}
      <AppointmentCalendar
        meetings={meetings}
        selected={selectedDate}
        onSelect={handleDateSelect}
        showMeetingDetails={false}
        className="w-full"
      />
      
      {/* No sessions state */}
      {!isLoading && meetings.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No sessions scheduled</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleViewAllSessions}
            className="mt-3 hover:bg-teal-50 hover:border-teal-200"
          >
            Schedule a Session
          </Button>
        </div>
      )}
    </div>
  );
}