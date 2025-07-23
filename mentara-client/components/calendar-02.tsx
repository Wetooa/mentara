"use client"

import * as React from "react"
import { format, isSameDay } from "date-fns"
import { DayClickEventHandler } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Clock, 
  User, 
  Video, 
  CalendarDays,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

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
  showMeetingDetails = true
}: AppointmentCalendarProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    selected || new Date()
  )
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date())

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      onSelect?.(date)
      onDateClick?.(date)
    }
  }

  const handleDayClick: DayClickEventHandler = (day, modifiers) => {
    if (!modifiers.disabled) {
      handleDateSelect(day)
    }
  }

  // Get meetings for selected date
  const selectedDateMeetings = React.useMemo(() => {
    if (!selectedDate) return []
    return meetings.filter(meeting => {
      try {
        const meetingDate = new Date(meeting.startTime)
        return isSameDay(meetingDate, selectedDate)
      } catch {
        return false
      }
    })
  }, [meetings, selectedDate])

  // Get meetings count for each date
  const meetingsByDate = React.useMemo(() => {
    const map = new Map<string, Meeting[]>()
    meetings.forEach(meeting => {
      try {
        const date = new Date(meeting.startTime)
        const dateKey = format(date, 'yyyy-MM-dd')
        if (!map.has(dateKey)) {
          map.set(dateKey, [])
        }
        map.get(dateKey)!.push(meeting)
      } catch {
        // Skip invalid dates
      }
    })
    return map
  }, [meetings])

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid time'
      return format(date, 'h:mm a')
    } catch {
      return 'Invalid time'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${className}`}>
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
                onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              onDayClick={handleDayClick}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="w-full"
              showOutsideDays={true}
              fixedWeeks
              components={{
                DayButton: ({ day, modifiers, ...props }) => {
                  const dateKey = format(day.date, 'yyyy-MM-dd')
                  const dayMeetings = meetingsByDate.get(dateKey) || []
                  const hasEvents = dayMeetings.length > 0
                  
                  return (
                    <div className="relative w-full h-full">
                      <button
                        {...props}
                        className={`
                          w-full h-full min-h-[2.5rem] flex flex-col items-center justify-center
                          hover:bg-accent hover:text-accent-foreground
                          ${modifiers.selected ? 'bg-primary text-primary-foreground' : ''}
                          ${modifiers.today ? 'bg-accent text-accent-foreground' : ''}
                          ${modifiers.outside ? 'text-muted-foreground opacity-50' : ''}
                          ${modifiers.disabled ? 'text-muted-foreground opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <span className="text-sm">{day.date.getDate()}</span>
                        {hasEvents && (
                          <div className="flex gap-0.5 flex-wrap justify-center mt-0.5">
                            {dayMeetings.slice(0, 3).map((_, i) => (
                              <div 
                                key={i}
                                className="w-1 h-1 bg-primary rounded-full"
                              />
                            ))}
                            {dayMeetings.length > 3 && (
                              <span className="text-xs text-primary">+</span>
                            )}
                          </div>
                        )}
                      </button>
                    </div>
                  )
                }
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Meeting Details Section */}
      {showMeetingDetails && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
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
                  <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-30" />
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
                  <span className="text-muted-foreground">Days with Sessions:</span>
                  <span className="font-medium">{meetingsByDate.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected Date:</span>
                  <span className="font-medium">{selectedDateMeetings.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
