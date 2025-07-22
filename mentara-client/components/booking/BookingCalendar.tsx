"use client";

import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { useAvailableSlots } from "@/hooks/booking/useAvailableSlots";
import { TimeSlot } from "@/hooks/booking/useAvailableSlots";

interface BookingCalendarProps {
  therapistId: string;
  onSlotSelect?: (date: string, timeSlot: TimeSlot) => void;
  selectedDate?: Date;
  onDateSelect?: (date: Date | undefined) => void;
  className?: string;
}

export function BookingCalendar({
  therapistId,
  onSlotSelect,
  selectedDate,
  onDateSelect,
  className,
}: BookingCalendarProps) {
  const [calendarDate, setCalendarDate] = useState<Date>(selectedDate || new Date());
  
  // Format date for API
  const dateString = calendarDate.toISOString().split('T')[0];
  
  const {
    timeSlots,
    isLoading,
    error,
    hasSlots,
    getAvailableDurationsForSlot,
  } = useAvailableSlots(therapistId, dateString);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCalendarDate(date);
      onDateSelect?.(date);
    }
  };

  const handleSlotClick = (timeSlot: TimeSlot) => {
    if (onSlotSelect) {
      onSlotSelect(dateString, timeSlot);
    }
  };

  // Check if date has available slots (for calendar day highlighting)
  const isDayAvailable = (date: Date) => {
    // For now, allow all future dates
    // In a real implementation, you might want to check availability for each day
    return date >= new Date();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Calendar Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={calendarDate}
            onSelect={handleDateSelect}
            disabled={(date) => {
              // Disable past dates
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return date < today;
            }}
            modifiers={{
              available: isDayAvailable,
            }}
            modifiersClassNames={{
              available: "bg-green-100 text-green-900",
            }}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Time Slots Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Available Time Slots
            <Badge variant="secondary" className="ml-auto">
              {calendarDate.toLocaleDateString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load available slots. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {/* No Slots Available */}
          {!isLoading && !error && !hasSlots && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No available slots for this date.</p>
              <p className="text-sm">Try selecting a different date.</p>
            </div>
          )}

          {/* Available Slots */}
          {!isLoading && !error && hasSlots && (
            <div className="grid gap-2">
              {timeSlots.map((timeSlot, index) => {
                const availableDurations = getAvailableDurationsForSlot(timeSlot.startTime);
                
                return (
                  <Card
                    key={index}
                    className="cursor-pointer transition-all hover:shadow-md hover:bg-gray-50 border-gray-200"
                    onClick={() => handleSlotClick(timeSlot)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-lg">
                              {timeSlot.time}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex flex-wrap gap-1">
                            {availableDurations.map((duration) => (
                              <Badge 
                                key={duration.id} 
                                variant="outline" 
                                className="text-xs"
                              >
                                {duration.duration}min
                              </Badge>
                            ))}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      
                      {availableDurations.length > 0 && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {availableDurations.length} duration option{availableDurations.length !== 1 ? 's' : ''} available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const prevDay = new Date(calendarDate);
            prevDay.setDate(prevDay.getDate() - 1);
            if (prevDay >= new Date()) {
              handleDateSelect(prevDay);
            }
          }}
          disabled={calendarDate <= new Date()}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous Day
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const nextDay = new Date(calendarDate);
            nextDay.setDate(nextDay.getDate() + 1);
            handleDateSelect(nextDay);
          }}
        >
          Next Day
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

export default BookingCalendar;