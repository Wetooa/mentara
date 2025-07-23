"use client";

import * as React from "react";
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isSameMonth,
} from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  User,
  Video,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  therapistName?: string;
  clientName?: string;
  meetingUrl?: string;
  notes?: string;
}

interface AppointmentCalendarProps {
  meetings?: Meeting[];
  selected?: Date;
  onSelect?: (date: Date) => void;
  onDateClick?: (date: Date) => void;
  className?: string;
  showMeetingDetails?: boolean;
}

export default function AppointmentCalendar({
  meetings = [],
  selected,
  onSelect,
  onDateClick,
  className,
  showMeetingDetails = true,
}: AppointmentCalendarProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    selected || new Date()
  );
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onSelect?.(date);
      onDateClick?.(date);
    }
  };

  const handleDayClick = (date: Date) => {
    handleDateSelect(date);
  };

  // Get calendar days for the current month
  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const calendarDays = getCalendarDays();

  // Get meetings for selected date
  const selectedDateMeetings = React.useMemo(() => {
    if (!selectedDate) return [];
    return meetings.filter((meeting) => {
      try {
        const meetingDate = new Date(meeting.startTime);
        return isSameDay(meetingDate, selectedDate);
      } catch {
        return false;
      }
    });
  }, [meetings, selectedDate]);

  // Get meetings count for each date
  const meetingsByDate = React.useMemo(() => {
    const map = new Map<string, Meeting[]>();
    meetings.forEach((meeting) => {
      try {
        const date = new Date(meeting.startTime);
        const dateKey = format(date, "yyyy-MM-dd");
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(meeting);
      } catch {
        // Skip invalid dates
      }
    });
    return map;
  }, [meetings]);

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid time";
      return format(date, "h:mm a");
    } catch {
      return "Invalid time";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CONFIRMED":
        return "bg-green-100 text-green-800 border-green-200";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div
      className={`${showMeetingDetails ? "grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 h-full" : "w-full"} ${className}`}
    >
      {/* Calendar Section */}
      <div className={showMeetingDetails ? "lg:col-span-4" : "w-full"}>
        <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50 h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
              {format(currentMonth, "MMMM yyyy")}
            </CardTitle>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentMonth(
                    (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1)
                  )
                }
                className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 p-0 hover:bg-teal-50 hover:border-teal-200 transition-colors"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentMonth(
                    (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1)
                  )
                }
                className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 p-0 hover:bg-teal-50 hover:border-teal-200 transition-colors"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6 w-full flex-1">
            <div className="w-full h-full flex flex-col">
              {/* Week days header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="h-6 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-medium text-gray-600"
                    >
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{day.slice(0, 2)}</span>
                    </div>
                  )
                )}
              </div>

              {/* Calendar days grid */}
              <div className="grid grid-cols-7 gap-1 flex-1">
                {calendarDays.map((date, index) => {
                  const dateKey = format(date, "yyyy-MM-dd");
                  const dayMeetings = meetingsByDate.get(dateKey) || [];
                  const hasEvents = dayMeetings.length > 0;
                  const isSelectedDate =
                    selectedDate && isSameDay(date, selectedDate);
                  const isTodayDate = isToday(date);
                  const isCurrentMonth = isSameMonth(date, currentMonth);

                  return (
                    <button
                      key={index}
                      onClick={() => handleDayClick(date)}
                      className={`
                        relative min-h-[2.5rem] sm:min-h-[3rem] lg:min-h-[3.5rem] w-full flex flex-col items-center justify-center rounded-lg
                        font-medium transition-all duration-200 ease-in-out text-xs sm:text-sm
                        hover:bg-teal-50 hover:text-teal-900 hover:shadow-md hover:scale-105
                        ${
                          isSelectedDate
                            ? "bg-teal-600 text-white shadow-lg ring-2 ring-teal-200"
                            : "hover:bg-teal-50"
                        }
                        ${
                          isTodayDate && !isSelectedDate
                            ? "bg-teal-100 text-teal-900 font-semibold ring-1 ring-teal-300"
                            : ""
                        }
                        ${
                          !isCurrentMonth
                            ? "text-gray-400 opacity-50"
                            : "text-gray-700"
                        }
                      `}
                    >
                      <span className="text-xs sm:text-sm font-medium">
                        {date.getDate()}
                      </span>
                      {hasEvents && (
                        <div className="flex gap-0.5 flex-wrap justify-center mt-0.5">
                          {dayMeetings.slice(0, 3).map((meeting, i) => (
                            <div
                              key={i}
                              className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${
                                meeting.status === "CONFIRMED"
                                  ? "bg-green-500"
                                  : meeting.status === "SCHEDULED"
                                    ? "bg-blue-500"
                                    : meeting.status === "CANCELLED"
                                      ? "bg-red-500"
                                      : "bg-teal-500"
                              }`}
                              title={`${meeting.title} - ${meeting.status}`}
                            />
                          ))}
                          {dayMeetings.length > 3 && (
                            <span className="text-[8px] sm:text-[10px] text-teal-600 font-semibold">
                              +{dayMeetings.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meeting Details Section */}
      {showMeetingDetails && (
        <div className="space-y-3 lg:space-y-4 overflow-y-auto">
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base lg:text-lg">
                {selectedDate
                  ? format(selectedDate, "EEEE, MMM d, yyyy")
                  : "Select a date"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[300px] lg:max-h-[400px] overflow-y-auto">
              {selectedDateMeetings.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="p-3 border rounded-lg space-y-2 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm leading-tight">
                          {meeting.title}
                        </h4>
                        <Badge
                          variant="outline"
                          className={`text-xs shrink-0 ${getStatusColor(meeting.status)}`}
                        >
                          {meeting.status?.toLowerCase().replace("_", " ")}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>
                            {formatTime(meeting.startTime)} -{" "}
                            {formatTime(meeting.endTime)}
                          </span>
                        </div>

                        {(meeting.therapistName || meeting.clientName) && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {meeting.therapistName || meeting.clientName}
                            </span>
                          </div>
                        )}

                        {meeting.meetingUrl && (
                          <div className="flex items-center gap-1">
                            <Video className="h-3 w-3 shrink-0" />
                            <span>Video session available</span>
                          </div>
                        )}
                      </div>

                      {meeting.notes && (
                        <p className="text-xs text-muted-foreground italic leading-relaxed">
                          &ldquo;{meeting.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 lg:py-8 text-muted-foreground">
                  <CalendarDays className="h-6 w-6 lg:h-8 lg:w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs sm:text-sm">
                    No sessions scheduled for this date
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Sessions:</span>
                  <span className="font-medium">{meetings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Days with Sessions:
                  </span>
                  <span className="font-medium">{meetingsByDate.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected Date:</span>
                  <span className="font-medium">
                    {selectedDateMeetings.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
