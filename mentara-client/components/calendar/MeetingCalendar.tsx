"use client"

import React, { useState } from 'react'
import { EnhancedCalendar } from '@/components/ui/enhanced-calendar'
import { useCalendarMeetings } from '@/hooks/useCalendarMeetings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Calendar, Clock, User } from 'lucide-react'
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'

interface MeetingCalendarProps {
  /**
   * Calendar title - defaults to "Meeting Schedule"
   */
  title?: string
  
  /**
   * Show the calendar header with title and refresh button
   */
  showHeader?: boolean
  
  /**
   * Show meeting statistics summary
   */
  showStats?: boolean
  
  /**
   * Custom hover delay for tooltips (ms)
   */
  hoverDelay?: number
  
  /**
   * Callback when a date is selected
   */
  onDateSelect?: (date: Date) => void
  
  /**
   * Custom CSS classes
   */
  className?: string
  
  /**
   * Meeting status filter
   */
  statusFilter?: string
  
  /**
   * Limit number of meetings to fetch
   */
  limit?: number
}

export function MeetingCalendar({
  title = "Meeting Schedule",
  showHeader = true,
  showStats = true,
  hoverDelay = 3000,
  onDateSelect,
  className,
  statusFilter,
  limit = 100,
}: MeetingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  // Fetch meeting data
  const { 
    meetings, 
    isLoading, 
    error, 
    refetch 
  } = useCalendarMeetings({
    status: statusFilter,
    limit,
  })
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    onDateSelect?.(date)
  }
  
  // Calculate meeting statistics
  const stats = React.useMemo(() => {
    const now = new Date()
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    
    const monthMeetings = meetings.filter(meeting => {
      const meetingDate = new Date(meeting.startTime)
      return meetingDate >= monthStart && meetingDate <= monthEnd
    })
    
    return {
      total: monthMeetings.length,
      scheduled: monthMeetings.filter(m => m.status === 'SCHEDULED').length,
      confirmed: monthMeetings.filter(m => m.status === 'CONFIRMED').length,
      completed: monthMeetings.filter(m => m.status === 'COMPLETED').length,
      cancelled: monthMeetings.filter(m => m.status === 'CANCELLED').length,
      inProgress: monthMeetings.filter(m => m.status === 'IN_PROGRESS').length,
    }
  }, [meetings, currentMonth])
  
  // Handle month navigation
  const handleMonthChange = (increment: number) => {
    if (increment > 0) {
      setCurrentMonth(addMonths(currentMonth, 1))
    } else {
      setCurrentMonth(subMonths(currentMonth, 1))
    }
  }
  
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="text-destructive text-sm mb-2">Failed to load meetings</div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
          >
            <RefreshCw className="size-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            {title}
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`size-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
      )}
      
      <CardContent>
        {/* Meeting Statistics */}
        {showStats && (
          <div className="mb-6 grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">Scheduled:</span>
              <Badge variant="secondary">{stats.scheduled}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Confirmed:</span>
              <Badge variant="secondary">{stats.confirmed}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-muted-foreground">In Progress:</span>
              <Badge variant="secondary">{stats.inProgress}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span className="text-muted-foreground">Completed:</span>
              <Badge variant="secondary">{stats.completed}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Cancelled:</span>
              <Badge variant="secondary">{stats.cancelled}</Badge>
            </div>
          </div>
        )}
        
        {/* Enhanced Calendar */}
        <div className="flex justify-center">
          <EnhancedCalendar
            meetings={meetings}
            onDateSelect={handleDateSelect}
            selected={selectedDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            hoverDelay={hoverDelay}
            showMeetingIndicators={true}
            className="border-0"
          />
        </div>
        
        {/* Selected Date Info */}
        {selectedDate && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="size-4" />
              Meetings for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h4>
            
            {(() => {
              const dayMeetings = meetings.filter(meeting => 
                new Date(meeting.startTime).toDateString() === selectedDate.toDateString()
              )
              
              if (dayMeetings.length === 0) {
                return (
                  <div className="text-sm text-muted-foreground py-4 text-center">
                    No meetings scheduled for this day
                  </div>
                )
              }
              
              return (
                <div className="space-y-3">
                  {dayMeetings
                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                    .map((meeting) => (
                      <div 
                        key={meeting.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          meeting.status === 'SCHEDULED' ? 'bg-blue-500' :
                          meeting.status === 'CONFIRMED' ? 'bg-green-500' :
                          meeting.status === 'CANCELLED' ? 'bg-red-500' :
                          meeting.status === 'IN_PROGRESS' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        }`} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {meeting.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(meeting.startTime), 'h:mm a')} - {format(new Date(meeting.endTime), 'h:mm a')}
                          </div>
                          {(meeting.therapistName || meeting.clientName) && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <User className="size-3" />
                              {meeting.therapistName && `Therapist: ${meeting.therapistName}`}
                              {meeting.therapistName && meeting.clientName && ' | '}
                              {meeting.clientName && `Client: ${meeting.clientName}`}
                            </div>
                          )}
                        </div>
                        
                        <Badge 
                          variant={
                            meeting.status === 'CONFIRMED' ? 'default' :
                            meeting.status === 'CANCELLED' ? 'destructive' :
                            meeting.status === 'IN_PROGRESS' ? 'secondary' :
                            'outline'
                          }
                          className="text-xs"
                        >
                          {meeting.status.toLowerCase().replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                </div>
              )
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}