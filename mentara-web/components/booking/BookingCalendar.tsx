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
import { useAvailableSlots, TimeSlot } from "@/hooks/booking/useAvailableSlots";
import { TimezoneUtils } from "@/lib/utils/timezone";
import { DurationSelector, DurationOption } from "./DurationSelector";

interface BookingCalendarProps {
  therapistId: string;
  onSlotSelect?: (date: string, timeSlot: TimeSlot) => void;
  selectedDate?: Date;
  onDateSelect?: (date: Date | undefined) => void;
  selectedDuration?: DurationOption | null;
  onDurationSelect?: (duration: DurationOption) => void;
  className?: string;
}

export function BookingCalendar({
  therapistId,
  onSlotSelect,
  selectedDate,
  onDateSelect,
  selectedDuration,
  onDurationSelect,
  className,
}: Readonly<BookingCalendarProps>) {
  const [calendarDate, setCalendarDate] = useState<Date>(
    selectedDate || TimezoneUtils.getCurrent()
  );

  // Standard duration options
  const durationOptions: DurationOption[] = [
    { id: "30", name: "30 min", duration: 30, description: "Quick session" },
    { id: "60", name: "1 hour", duration: 60, description: "Standard session" },
    {
      id: "90",
      name: "1.5 hours",
      duration: 90,
      description: "Extended session",
    },
    {
      id: "120",
      name: "2 hours",
      duration: 120,
      description: "Deep dive session",
    },
  ];

  // Format date for API using Manila timezone
  const dateString = calendarDate
    ? TimezoneUtils.format(calendarDate, "yyyy-MM-dd")
    : TimezoneUtils.format(TimezoneUtils.getCurrent(), "yyyy-MM-dd");

  const {
    timeSlots,
    isLoading,
    error,
    hasSlots,
    getAvailableDurationsForSlot,
    refetch, // Add refetch function
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
    // Check if date is in the future (Manila time) and can be booked
    return !TimezoneUtils.isPast(date) && TimezoneUtils.canBook(date);
  };

  // Filter slots based on selected duration
  const filteredTimeSlots = selectedDuration
    ? timeSlots.filter((slot) =>
        slot.availableDurations.some(
          (d) => d.duration === selectedDuration.duration
        )
      )
    : timeSlots;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Duration Selection - First Step */}
      {onDurationSelect && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Step 1: Choose Session Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DurationSelector
              durations={durationOptions}
              selectedDuration={selectedDuration || null}
              onSelect={onDurationSelect}
            />
          </CardContent>
        </Card>
      )}

      {/* Calendar Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {onDurationSelect ? "Step 2: Select Date" : "Select Date"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full">
            <Calendar
              mode="single"
              selected={calendarDate}
              onSelect={handleDateSelect}
              disabled={(date) => {
                // Disable past dates and dates that can't be booked (24 hours in advance)
                return (
                  TimezoneUtils.isPast(date) || !TimezoneUtils.canBook(date)
                );
              }}
              modifiers={{
                available: isDayAvailable,
              }}
              modifiersClassNames={{
                available: "bg-green-100 text-green-900",
              }}
              className="w-full rounded-none border-0"
              classNames={{
                months:
                  "flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4 w-full flex flex-col",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                caption_dropdowns: "flex justify-center gap-1",
                nav: "space-x-1 flex items-center",
                nav_button:
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex w-full",
                head_cell:
                  "text-muted-foreground rounded-md w-full font-normal text-[0.8rem] flex-1 text-center",
                row: "flex w-full mt-2",
                cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1",
                day: "h-9 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside:
                  "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle:
                  "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Time Slots Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {onDurationSelect
              ? "Step 3: Choose Time Slot"
              : "Available Time Slots"}
            {selectedDuration && (
              <Badge variant="default" className="ml-2">
                {selectedDuration.duration} min sessions
              </Badge>
            )}
            <Badge variant="secondary" className="ml-auto">
              {TimezoneUtils.formatForDisplay(calendarDate)}
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
              <AlertDescription className="space-y-2">
                <div>
                  {(() => {
                    if (error.message?.includes("advance")) {
                      return "Bookings must be made at least 24 hours (1 day) in advance. Please select a later date or time.";
                    }
                    if (
                      error.message?.includes("404") ||
                      error.message?.includes("not found")
                    ) {
                      return "Therapist availability not found. Please try selecting a different date.";
                    }
                    if (
                      error.message?.includes("401") ||
                      error.message?.includes("unauthorized")
                    ) {
                      return "Please sign in again to view available slots.";
                    }
                    return "Failed to load available slots. Please check your connection and try again.";
                  })()}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="mt-2"
                >
                  Retry
                </Button>
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

          {/* Duration Selection Required Message */}
          {!isLoading &&
            !error &&
            hasSlots &&
            selectedDuration === undefined &&
            onDurationSelect && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="font-medium">Select a session duration first</p>
                <p className="text-sm">
                  Choose how long you'd like your session to be above
                </p>
              </div>
            )}

          {/* No Slots for Selected Duration */}
          {!isLoading &&
            !error &&
            hasSlots &&
            selectedDuration &&
            filteredTimeSlots.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>
                  No {selectedDuration.duration}-minute slots available for this
                  date.
                </p>
                <p className="text-sm">Try a different duration or date.</p>
              </div>
            )}

          {/* Available Slots */}
          {!isLoading &&
            !error &&
            hasSlots &&
            (!selectedDuration || filteredTimeSlots.length > 0) && (
              <div className="grid gap-2">
                {filteredTimeSlots.map((timeSlot, index) => {
                  const availableDurations = getAvailableDurationsForSlot(
                    timeSlot.startTime
                  );

                  return (
                    <Card
                      key={index}
                      className="cursor-pointer transition-all hover:shadow-md hover:bg-primary/5 hover:border-primary border-gray-200"
                      onClick={() => handleSlotClick(timeSlot)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium text-lg">
                                  {timeSlot.time}
                                </div>
                                {selectedDuration && (
                                  <div className="text-xs text-muted-foreground">
                                    {selectedDuration.duration} minute session
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {!selectedDuration && (
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
                            )}
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
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
            if (
              !TimezoneUtils.isPast(prevDay) &&
              TimezoneUtils.canBook(prevDay)
            ) {
              handleDateSelect(prevDay);
            }
          }}
          disabled={
            TimezoneUtils.isPast(calendarDate) ||
            !TimezoneUtils.canBook(calendarDate)
          }
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
