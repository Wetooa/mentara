"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2 }
    }
  };

  const meetingVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2 }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.15 }
    }
  };

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

  const getStatusIndicatorColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SCHEDULED":
        return "bg-blue-500";
      case "CONFIRMED":
        return "bg-emerald-500";
      case "IN_PROGRESS":
        return "bg-amber-500";
      case "COMPLETED":
        return "bg-slate-400";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <motion.div
      className={`${showMeetingDetails ? "grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 h-full" : "w-full"} ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Calendar Section */}
      <div className={showMeetingDetails ? "lg:col-span-4" : "w-full"}>
        <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50 h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
              {format(currentMonth, "MMMM yyyy")}
            </CardTitle>
            <div className="flex items-center gap-1 sm:gap-2">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentMonth(
                      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1)
                    )
                  }
                  className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 p-0 hover:bg-teal-50 hover:border-teal-200 hover:shadow-md transition-all duration-200"
                >
                  <motion.div whileHover={{ x: -2 }} transition={{ type: "spring", stiffness: 400 }}>
                    <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  </motion.div>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentMonth(
                      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1)
                    )
                  }
                  className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 p-0 hover:bg-teal-50 hover:border-teal-200 hover:shadow-md transition-all duration-200"
                >
                  <motion.div whileHover={{ x: 2 }} transition={{ type: "spring", stiffness: 400 }}>
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </motion.div>
                </Button>
              </motion.div>
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6 w-full flex-1">
            <div className="w-full h-full flex flex-col" role="application" aria-label="Calendar for appointment management">
              {/* Week days header */}
              <div className="grid grid-cols-7 gap-1 mb-2" role="row">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="h-6 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-medium text-gray-600"
                      role="columnheader"
                      aria-label={`${day}day`}
                    >
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{day.slice(0, 2)}</span>
                    </div>
                  )
                )}
              </div>

              {/* Calendar days grid */}
              <div className="grid grid-cols-7 gap-1 flex-1" role="grid">
                {calendarDays.map((date, index) => {
                  const dateKey = format(date, "yyyy-MM-dd");
                  const dayMeetings = meetingsByDate.get(dateKey) || [];
                  const hasEvents = dayMeetings.length > 0;
                  const isSelectedDate =
                    selectedDate && isSameDay(date, selectedDate);
                  const isTodayDate = isToday(date);
                  const isCurrentMonth = isSameMonth(date, currentMonth);

                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleDayClick(date)}
                      className={`
                        relative min-h-[2.5rem] sm:min-h-[3rem] lg:min-h-[3.5rem] w-full flex flex-col items-center justify-center rounded-lg
                        font-medium transition-all duration-200 ease-in-out text-xs sm:text-sm
                        ${
                          isSelectedDate
                            ? "bg-teal-600 text-white shadow-lg ring-2 ring-teal-200"
                            : ""
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
                      whileHover={isCurrentMonth ? { 
                        scale: 1.05,
                        backgroundColor: isSelectedDate ? "#0d9488" : "#f0fdfa",
                        color: isSelectedDate ? "#ffffff" : "#134e4a",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                      } : {}}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      role="gridcell"
                      aria-selected={isSelectedDate}
                      aria-current={isTodayDate ? "date" : undefined}
                      aria-label={`${format(date, "EEEE, MMMM d, yyyy")}${hasEvents ? ` - ${dayMeetings.length} appointment${dayMeetings.length > 1 ? 's' : ''}` : ''}`}
                      tabIndex={isSelectedDate ? 0 : -1}
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
                    </motion.button>
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
              <AnimatePresence mode="wait">
                {selectedDateMeetings.length > 0 ? (
                  <motion.div 
                    key="meetings"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="space-y-3"
                  >
                    {selectedDateMeetings.map((meeting, index) => (
                      <motion.div
                        key={meeting.id}
                        variants={meetingVariants}
                        custom={index}
                        layout
                        className={`p-4 border rounded-lg space-y-2 cursor-pointer ${getStatusColor(meeting.status).includes('blue') ? 'bg-blue-50/30' : getStatusColor(meeting.status).includes('emerald') ? 'bg-emerald-50/30' : getStatusColor(meeting.status).includes('amber') ? 'bg-amber-50/30' : getStatusColor(meeting.status).includes('red') ? 'bg-red-50/30' : 'bg-slate-50/30'}`}
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                          y: -3,
                          borderColor: "#3b82f6"
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <div className={`w-1 h-4 rounded-full ${getStatusIndicatorColor(meeting.status)} mt-0.5`} />
                          <h4 className="font-semibold text-sm leading-tight text-slate-900">
                            {meeting.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusIndicatorColor(meeting.status)}`} />
                          <Badge
                            variant="outline"
                            className={`text-xs shrink-0 ${getStatusColor(meeting.status)} font-medium`}
                          >
                            {meeting.status?.toLowerCase().replace("_", " ")}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 bg-white/60 rounded-md p-2">
                          <Clock className="h-3 w-3 shrink-0 text-blue-600" />
                          <span className="font-medium text-slate-900">
                            {formatTime(meeting.startTime)} -{" "}
                            {formatTime(meeting.endTime)}
                          </span>
                        </div>

                        {(meeting.therapistName || meeting.clientName) && (
                          <div className="flex items-center gap-2 bg-white/60 rounded-md p-2">
                            <User className="h-3 w-3 shrink-0 text-blue-600" />
                            <span className="truncate font-medium text-slate-900">
                              {meeting.therapistName || meeting.clientName}
                            </span>
                          </div>
                        )}

                        {meeting.meetingUrl && (
                          <div className="flex items-center gap-2 bg-emerald-50 rounded-md p-2">
                            <Video className="h-3 w-3 shrink-0 text-emerald-600" />
                            <span className="font-medium text-emerald-900">Video session ready</span>
                          </div>
                        )}
                      </div>

                      {meeting.notes && (
                        <div className="bg-white/80 rounded-md p-2 border-l-2 border-blue-300">
                          <p className="text-xs text-slate-700 italic leading-relaxed">
                            &ldquo;{meeting.notes}&rdquo;
                          </p>
                        </div>
                      )}
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="text-center py-8 lg:py-12"
                  >
                    <motion.div 
                      className="rounded-full bg-blue-100 p-4 mb-4 mx-auto w-fit"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <CalendarDays className="h-8 w-8 lg:h-10 lg:w-10 text-blue-600" />
                    </motion.div>
                    <h3 className="text-sm font-medium text-slate-900 mb-1">No sessions scheduled</h3>
                    <p className="text-xs text-slate-600">
                      No therapy sessions are scheduled for this date
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Enhanced Quick Stats */}
          <Card className="h-fit bg-gradient-to-br from-blue-50 to-slate-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-900 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between items-center p-2 bg-white/60 rounded-md">
                  <span className="text-slate-600 font-medium">Total Sessions:</span>
                  <span className="font-bold text-blue-900">{meetings.length}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/60 rounded-md">
                  <span className="text-slate-600 font-medium">Active Days:</span>
                  <span className="font-bold text-blue-900">{meetingsByDate.size}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-100/60 rounded-md border border-blue-200">
                  <span className="text-blue-700 font-medium">Selected Date:</span>
                  <div className="flex items-center gap-2">
                    {selectedDateMeetings.length > 0 && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                    <span className="font-bold text-blue-900">{selectedDateMeetings.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
}
