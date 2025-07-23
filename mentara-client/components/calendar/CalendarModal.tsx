"use client";

import { useState, useCallback } from "react";
import { format, addMonths, subMonths } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnhancedCalendar } from "@/components/ui/enhanced-calendar";
import { useCalendarMeetings } from "@/hooks/calendar/useCalendarMeetings";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  User,
  Video,
  X,
  RefreshCw
} from "lucide-react";

interface CalendarModalProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CalendarModal({ trigger, isOpen, onOpenChange }: CalendarModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const { meetings, isLoading, error, refetch } = useCalendarMeetings({
    limit: 200 // Get more meetings for full calendar view
  });

  // Get meetings for selected date
  const selectedDateMeetings = meetings.filter(meeting => {
    const meetingDate = new Date(meeting.startTime);
    return meetingDate.toDateString() === selectedDate.toDateString();
  });

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch {
      return 'Invalid time';
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <CalendarIcon className="h-4 w-4 mr-2" />
      View Full Calendar
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CalendarIcon className="h-5 w-5" />
            Sessions Calendar
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="text-xs"
            >
              Today
            </Button>
            {error && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg">
                  {format(currentMonth, 'MMMM yyyy')}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousMonth}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextMonth}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {error ? (
                  <div className="text-center py-8 text-destructive">
                    <div className="text-sm mb-2">Failed to load calendar</div>
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <EnhancedCalendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    meetings={meetings}
                    showMeetingIndicators={true}
                    hoverDelay={500}
                    className="w-full"
                    showOutsideDays={true}
                    fixedWeeks={true}
                  />
                )}
                
                {isLoading && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Loading calendar data...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Selected Date Details */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDateMeetings.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateMeetings.map((meeting) => (
                      <div
                        key={meeting.id}
                        className="p-3 border rounded-lg space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm">{meeting.title}</h4>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getStatusColor(meeting.status)}`}
                          >
                            {meeting.status?.toLowerCase().replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                            </span>
                          </div>
                          
                          {(meeting.therapistName || meeting.clientName) && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>
                                {meeting.therapistName || meeting.clientName}
                              </span>
                            </div>
                          )}
                          
                          {meeting.meetingUrl && (
                            <div className="flex items-center gap-1">
                              <Video className="h-3 w-3" />
                              <span>Video session available</span>
                            </div>
                          )}
                        </div>
                        
                        {meeting.notes && (
                          <p className="text-xs text-muted-foreground italic">
                            "{meeting.notes}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No sessions scheduled for this date</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Sessions:</span>
                    <span className="font-medium">{meetings.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">This Week:</span>
                    <span className="font-medium">
                      {meetings.filter(meeting => {
                        const meetingDate = new Date(meeting.startTime);
                        const now = new Date();
                        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekStart.getDate() + 6);
                        return meetingDate >= weekStart && meetingDate <= weekEnd;
                      }).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Today:</span>
                    <span className="font-medium">
                      {meetings.filter(meeting => {
                        const meetingDate = new Date(meeting.startTime);
                        const today = new Date();
                        return meetingDate.toDateString() === today.toDateString();
                      }).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}