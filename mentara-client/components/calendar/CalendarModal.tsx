"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="w-3xl max-w-[1400px] h-[90vh] max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b bg-gradient-to-r from-teal-50 to-blue-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-gray-900">
              <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600" />
              Sessions Calendar
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="text-xs sm:text-sm h-8 px-3 hover:bg-teal-50 hover:border-teal-200"
              >
                <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Today
              </Button>
              {error && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="text-xs sm:text-sm h-8 px-3 hover:bg-red-50 hover:border-red-200"
                >
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Retry
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/30">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                <div className="text-red-600 mb-3">
                  <CalendarIcon className="h-12 w-12 mx-auto opacity-50" />
                </div>
                <h3 className="text-lg font-medium text-red-900 mb-2">
                  Failed to load calendar
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  Unable to fetch your sessions. Please try again.
                </p>
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  className="hover:bg-red-50 hover:border-red-300"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full">
              <AppointmentCalendar
                meetings={meetings}
                selected={selectedDate}
                onSelect={handleDateSelect}
                showMeetingDetails={true}
                className="h-full"
              />
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-600 font-medium">
                  Loading calendar data...
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
