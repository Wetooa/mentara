"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EnhancedCalendar } from '@/components/ui/enhanced-calendar'
import { useCalendarMeetings } from '@/hooks/calendar/useCalendarMeetings'
import { Calendar, Clock, ArrowRight, RefreshCw } from 'lucide-react'
import { format, isToday, isTomorrow, isYesterday } from 'date-fns'
import { useRouter } from 'next/navigation'

interface DashboardCalendarWidgetProps {
  className?: string
}

export function DashboardCalendarWidget({ className }: DashboardCalendarWidgetProps) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const router = useRouter()
  
  const { meetings, isLoading, error, refetch } = useCalendarMeetings({
    limit: 50
  })
  
  // Get today's meetings for quick stats
  const todaysMeetings = meetings.filter(meeting => 
    isToday(new Date(meeting.startTime))
  )
  
  // Get upcoming meetings (next 3 days)
  const upcomingMeetings = meetings
    .filter(meeting => {
      const meetingDate = new Date(meeting.startTime)
      return meetingDate >= new Date() && meeting.status !== 'CANCELLED'
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3)
  
  const formatRelativeDate = (date: Date) => {
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'MMM d')
  }
  
  const handleViewFullCalendar = () => {
    router.push('/therapist/schedule?tab=calendar')
  }
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    // Navigate to schedule page with the selected date
    router.push(`/therapist/schedule?date=${date.toISOString().split('T')[0]}`)
  }
  
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-6">
          <div className="text-center">
            <div className="text-sm text-destructive mb-2">Failed to load calendar</div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="size-3 mr-1" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="size-4" />
          Calendar
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleViewFullCalendar}
          className="text-xs"
        >
          View All
          <ArrowRight className="size-3 ml-1" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Today:</span>
            <Badge variant="outline">{todaysMeetings.length}</Badge>
          </div>
          {isLoading && (
            <div className="text-muted-foreground text-xs">Loading...</div>
          )}
        </div>
        
        {/* Compact Calendar */}
        <div className="flex justify-center">
          <EnhancedCalendar
            meetings={meetings}
            onDateSelect={handleDateSelect}
            selected={selectedDate}
            hoverDelay={2000} // Faster hover for dashboard
            className="scale-90 border-0 p-0"
          />
        </div>
        
        {/* Upcoming Meetings Preview */}
        {upcomingMeetings.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
              <Clock className="size-3" />
              Upcoming
            </h4>
            <div className="space-y-2">
              {upcomingMeetings.map((meeting) => {
                const meetingDate = new Date(meeting.startTime)
                return (
                  <div 
                    key={meeting.id}
                    className="flex items-center gap-2 p-2 rounded-md bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleDateSelect(meetingDate)}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      meeting.status === 'SCHEDULED' ? 'bg-blue-500' :
                      meeting.status === 'CONFIRMED' ? 'bg-green-500' :
                      meeting.status === 'IN_PROGRESS' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">
                        {meeting.clientName || meeting.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatRelativeDate(meetingDate)} • {format(meetingDate, 'h:mm a')}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {/* No meetings state */}
        {!isLoading && upcomingMeetings.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            <Calendar className="size-8 mx-auto mb-2 opacity-30" />
            <p>No upcoming meetings</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}