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
import { 
  Calendar as CalendarIcon, 
  RefreshCw
} from "lucide-react";

interface CalendarModalProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CalendarModal({ trigger, isOpen, onOpenChange }: CalendarModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { meetings, isLoading, error, refetch } = useCalendarMeetings({
    limit: 200 // Get more meetings for full calendar view
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

        <div className="overflow-y-auto">
          {error ? (
            <div className="text-center py-8 text-destructive">
              <div className="text-sm mb-2">Failed to load calendar</div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Try Again
              </Button>
            </div>
          ) : (
            <AppointmentCalendar
              meetings={meetings}
              selected={selectedDate}
              onSelect={handleDateSelect}
              showMeetingDetails={true}
              className="w-full"
            />
          )}
          
          {isLoading && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Loading calendar data...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}