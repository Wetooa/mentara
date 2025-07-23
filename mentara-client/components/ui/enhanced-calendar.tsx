"use client"

import * as React from "react"
import { useState, useCallback, useRef } from "react"
import { DayPicker, DayProps } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, isSameDay, parseISO, isValid } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Meeting data interface
interface MeetingData {
  id: string
  title: string
  startTime: string
  endTime: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  therapistId?: string
  therapistName?: string
  clientId?: string
  clientName?: string
  meetingUrl?: string
  notes?: string
}

interface EnhancedCalendarProps extends Omit<React.ComponentProps<typeof DayPicker>, 'components'> {
  meetings?: MeetingData[]
  onDateSelect?: (date: Date) => void
  showMeetingIndicators?: boolean
  hoverDelay?: number
}

// Meeting status color mapping
const getStatusColor = (status: MeetingData['status']) => {
  switch (status) {
    case 'SCHEDULED':
      return 'bg-blue-500'
    case 'CONFIRMED':
      return 'bg-green-500'
    case 'CANCELLED':
      return 'bg-red-500'
    case 'IN_PROGRESS':
      return 'bg-yellow-500'
    case 'COMPLETED':
      return 'bg-gray-500'
    default:
      return 'bg-blue-500'
  }
}

// Custom Day component with meeting indicators and hover tooltips
function DayWithMeetings({ 
  date, 
  meetings = [], 
  hoverDelay = 3000,
  ...props 
}: DayProps & { 
  meetings?: MeetingData[]
  hoverDelay?: number 
}) {
  const [showTooltip, setShowTooltip] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout>()
  const leaveTimeoutRef = useRef<NodeJS.Timeout>()

  // Get meetings for this specific date with robust error handling
  const dayMeetings = meetings.filter(meeting => {
    try {
      if (!meeting?.startTime || !date || !isValid(date)) return false;
      const meetingDate = parseISO(meeting.startTime);
      return isValid(meetingDate) && isSameDay(meetingDate, date);
    } catch (error) {
      console.warn('Error filtering meeting for date:', error);
      return false;
    }
  })

  const handleMouseEnter = useCallback(() => {
    // Clear any existing leave timeout
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current)
    }
    
    // Only show tooltip if there are meetings
    if (dayMeetings.length > 0) {
      hoverTimeoutRef.current = setTimeout(() => {
        setShowTooltip(true)
      }, hoverDelay)
    }
  }, [dayMeetings.length, hoverDelay])

  const handleMouseLeave = useCallback(() => {
    // Clear hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    
    // Hide tooltip after a brief delay
    leaveTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false)
    }, 200)
  }, [])

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        {...props}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "size-12 p-0 font-normal aria-selected:opacity-100 relative",
          props.className
        )}
      >
        {date && isValid(date) ? format(date, 'd') : '?'}
        
        {/* Meeting indicators */}
        {dayMeetings.length > 0 && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
            {dayMeetings.slice(0, 3).map((meeting, index) => (
              <div
                key={meeting.id}
                className={cn(
                  "w-2 h-2 rounded-full",
                  getStatusColor(meeting.status)
                )}
              />
            ))}
            {dayMeetings.length > 3 && (
              <div className="w-2 h-2 rounded-full bg-gray-400 text-xs flex items-center justify-center">
                <span className="text-white text-[8px] leading-none">+</span>
              </div>
            )}
          </div>
        )}
      </button>

      {/* Hover Tooltip */}
      {showTooltip && dayMeetings.length > 0 && (
        <Card className="absolute z-50 top-full mt-2 left-1/2 transform -translate-x-1/2 w-80 shadow-lg border">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="font-medium text-sm border-b pb-2">
                {date && isValid(date) ? format(date, 'EEEE, MMMM d, yyyy') : 'Invalid Date'}
              </div>
              
              {dayMeetings.map((meeting) => (
                <div key={meeting.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className={cn(
                        "w-3 h-3 rounded-full flex-shrink-0",
                        getStatusColor(meeting.status)
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{meeting.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {(() => {
                          try {
                            if (!meeting.startTime) return 'Time not available';
                            const startDate = parseISO(meeting.startTime);
                            if (!isValid(startDate)) return 'Invalid start time';
                            
                            if (meeting.endTime) {
                              const endDate = parseISO(meeting.endTime);
                              if (isValid(endDate)) {
                                return `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;
                              }
                            }
                            return format(startDate, 'h:mm a');
                          } catch {
                            return 'Time unavailable';
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  {(meeting.therapistName || meeting.clientName) && (
                    <div className="text-xs text-muted-foreground ml-5">
                      {meeting.therapistName && (
                        <div>Therapist: {meeting.therapistName}</div>
                      )}
                      {meeting.clientName && (
                        <div>Client: {meeting.clientName}</div>
                      )}
                    </div>
                  )}
                  
                  <div className="text-xs ml-5">
                    <span className={cn(
                      "inline-block px-2 py-1 rounded-full text-white",
                      getStatusColor(meeting.status)
                    )}>
                      {meeting.status.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                  
                  {meeting.notes && (
                    <div className="text-xs text-muted-foreground ml-5 italic">
                      "{meeting.notes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function EnhancedCalendar({
  className,
  classNames,
  meetings = [],
  onDateSelect,
  showMeetingIndicators = true,
  hoverDelay = 3000,
  showOutsideDays = true,
  ...props
}: EnhancedCalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-6", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-6",
        caption: "flex justify-center pt-2 relative items-center w-full",
        caption_label: "text-lg font-semibold",
        nav: "flex items-center gap-2",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-9 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-2",
        nav_button_next: "absolute right-2",
        table: "w-full border-collapse space-x-1",
        head_row: "flex mb-2",
        head_cell:
          "text-muted-foreground rounded-md w-12 font-medium text-sm",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          "size-12 p-0 font-normal aria-selected:opacity-100 relative"
        ),
        day_range_start:
          "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end:
          "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground font-semibold",
        day_outside:
          "day-outside text-muted-foreground aria-selected:text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...iconProps }) => (
          <ChevronLeft className={cn("size-5", className)} {...iconProps} />
        ),
        IconRight: ({ className, ...iconProps }) => (
          <ChevronRight className={cn("size-5", className)} {...iconProps} />
        ),
        Day: showMeetingIndicators 
          ? (dayProps) => (
              <DayWithMeetings 
                {...dayProps} 
                meetings={meetings} 
                hoverDelay={hoverDelay}
              />
            )
          : undefined,
      }}
      onDayClick={onDateSelect}
      {...props}
    />
  )
}