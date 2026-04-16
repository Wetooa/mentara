"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from "date-fns";
import type { Meeting } from "@/lib/api/services/meetings";
import { useSessions } from "@/hooks/sessions";
import { motion } from "framer-motion";

interface SessionsCalendarViewProps {
  onSessionClick?: (session: Meeting) => void;
  filterStatus?: Meeting["status"];
}

export function SessionsCalendarView({ onSessionClick, filterStatus }: SessionsCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const { data: sessions = [], isLoading } = useSessions({
    status: filterStatus,
    limit: 100,
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get sessions for a specific day
  const getSessionsForDay = (day: Date) => {
    return sessions.filter(session => {
      try {
        return isSameDay(parseISO(session.startTime), day);
      } catch {
        return false;
      }
    });
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getDayColor = (day: Date) => {
    const daySessions = getSessionsForDay(day);
    if (daySessions.length === 0) return '';
    
    const hasUpcoming = daySessions.some(s => s.status === 'SCHEDULED' || s.status === 'CONFIRMED');
    const hasInProgress = daySessions.some(s => s.status === 'IN_PROGRESS');
    const hasCompleted = daySessions.some(s => s.status === 'COMPLETED');
    
    if (hasInProgress) return 'bg-green-100 border-green-300';
    if (hasUpcoming) return 'bg-blue-100 border-blue-300';
    if (hasCompleted) return 'bg-gray-100 border-gray-300';
    return '';
  };

  if (isLoading) {
    return (
      <Card className="h-full shadow-lg border-primary/20 p-0">
        <div className="p-6 flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-y-auto shadow-lg border-primary/20 p-0">
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Calendar View
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousMonth}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:border-primary/30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold min-w-[120px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:border-primary/30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="p-6">
        {/* Calendar Grid */}
        <div className="space-y-4">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-xs font-semibold text-center text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {/* Actual days */}
            {daysInMonth.map(day => {
              const daySessions = getSessionsForDay(day);
              const hasMultipleSessions = daySessions.length > 1;
              
              return (
                <motion.div
                  key={day.toISOString()}
                  whileHover={{ scale: 1.05 }}
                  className={`aspect-square relative border-2 rounded-lg p-1 transition-all cursor-pointer ${
                    isToday(day) 
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/20' 
                      : getDayColor(day) || 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${!isSameMonth(day, currentMonth) ? 'opacity-40' : ''}`}
                >
                  <div className="text-xs font-semibold text-center mb-1">
                    {format(day, 'd')}
                  </div>
                  {daySessions.length > 0 && (
                    <div className="space-y-0.5">
                      {daySessions.slice(0, 2).map(session => (
                        <div
                          key={session.id}
                          onClick={() => onSessionClick?.(session)}
                          className="bg-primary text-primary-foreground text-[8px] px-1 py-0.5 rounded truncate hover:bg-primary/90"
                          title={`${format(parseISO(session.startTime), 'h:mm a')} - ${session.therapist?.user.firstName || 'Session'}`}
                        >
                          {format(parseISO(session.startTime), 'h:mm a')}
                        </div>
                      ))}
                      {hasMultipleSessions && (
                        <div className="text-[8px] text-center text-primary font-bold">
                          +{daySessions.length - 2}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-blue-100 border-2 border-blue-300"></div>
              <span className="text-xs text-gray-600">Upcoming</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-green-100 border-2 border-green-300"></div>
              <span className="text-xs text-gray-600">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-gray-100 border-2 border-gray-300"></div>
              <span className="text-xs text-gray-600">Completed</span>
            </div>
          </div>

          {/* Sessions List for Current Month */}
          {sessions.length > 0 && (
            <div className="pt-4 border-t border-border/50">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Sessions This Month ({sessions.filter(s => {
                  try {
                    return isSameMonth(parseISO(s.startTime), currentMonth);
                  } catch {
                    return false;
                  }
                }).length})
              </h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {sessions
                  .filter(s => {
                    try {
                      return isSameMonth(parseISO(s.startTime), currentMonth);
                    } catch {
                      return false;
                    }
                  })
                  .slice(0, 5)
                  .map(session => (
                    <div
                      key={session.id}
                      onClick={() => onSessionClick?.(session)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer border border-transparent hover:border-primary/30"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <CalendarIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {session.therapist?.user.firstName || 'Session'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(parseISO(session.startTime), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {format(parseISO(session.startTime), 'd')}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

