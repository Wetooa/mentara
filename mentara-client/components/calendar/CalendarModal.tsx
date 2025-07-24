"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import AppointmentCalendar from "@/components/calendar-02";
import { useCalendarMeetings } from "@/hooks/calendar/useCalendarMeetings";
import { Calendar as CalendarIcon, RefreshCw } from "lucide-react";

interface CalendarModalProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CalendarModal({
  trigger,
  isOpen,
  onOpenChange,
}: CalendarModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { meetings, isLoading, error, refetch } = useCalendarMeetings({
    limit: 200, // Get more meetings for full calendar view
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <CalendarIcon className="h-4 w-4 mr-2" />
      View Full Calendar
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger || defaultTrigger}</SheetTrigger>
      <SheetContent side="right" className="w-full max-w-5xl sm:max-w-4xl p-0 gap-0 overflow-hidden flex flex-col">
        <SheetHeader className="px-6 py-5 border-b bg-gradient-to-br from-teal-50/80 via-blue-50/60 to-indigo-50/80 backdrop-blur-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                <div className="p-2 rounded-lg bg-teal-100/80 shadow-sm">
                  <CalendarIcon className="h-5 w-5 text-teal-600" />
                </div>
                Sessions Calendar
              </SheetTitle>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 font-medium">
                Manage your therapy sessions
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToday}
                  className="text-sm h-9 px-4 bg-white/70 hover:bg-teal-50 hover:border-teal-300 border-gray-200 shadow-sm transition-all duration-200"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Today
                </Button>
                {error && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    className="text-sm h-9 px-4 bg-white/70 hover:bg-red-50 hover:border-red-300 border-gray-200 shadow-sm transition-all duration-200"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 min-h-0 bg-gradient-to-b from-gray-50/50 to-white relative">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200/60 rounded-xl p-6 sm:p-8 max-w-md mx-auto shadow-sm">
                <div className="text-red-500 mb-4">
                  <CalendarIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto opacity-60" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-red-900 mb-3">
                  Failed to load calendar
                </h3>
                <p className="text-sm text-red-700/80 mb-6 leading-relaxed">
                  Unable to fetch your sessions. Please check your connection and try again.
                </p>
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  className="bg-white hover:bg-red-50 hover:border-red-300 shadow-sm transition-all duration-200"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              <div className="p-4 sm:p-6">
                {/* Calendar Section */}
                <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm mb-6 overflow-hidden">
                  <div className="h-[300px] sm:h-[400px] md:h-[500px]">
                    <AppointmentCalendar
                      meetings={meetings}
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      showMeetingDetails={false}
                      className="h-full"
                    />
                  </div>
                </div>

                {/* Meeting Details Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Session Details
                    </h3>
                    <div className="text-sm text-gray-500">
                      {meetings.length} session{meetings.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  {meetings.length > 0 ? (
                    <div className="space-y-3">
                      {meetings.slice(0, 5).map((meeting, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200/60 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">
                              {meeting.title || 'Therapy Session'}
                            </h4>
                            <span className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-full">
                              {meeting.type || 'Session'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              {new Date(meeting.startTime).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <span>⏰</span>
                              {new Date(meeting.startTime).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </div>
                          </div>
                          {meeting.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {meeting.description}
                            </p>
                          )}
                        </div>
                      ))}
                      
                      {meetings.length > 5 && (
                        <div className="text-center py-3">
                          <div className="text-sm text-gray-500">
                            And {meetings.length - 5} more session{meetings.length - 5 !== 1 ? 's' : ''}...
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No sessions scheduled</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center">
              <div className="bg-gradient-to-br from-white to-gray-50/80 rounded-xl shadow-lg border border-gray-200/60 p-6 sm:p-8 flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-8 h-8 sm:w-10 sm:h-10 border-3 border-transparent border-b-teal-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                <div className="text-center">
                  <p className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
                    Loading Calendar
                  </p>
                  <p className="text-sm text-gray-600">
                    Fetching your session data...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
