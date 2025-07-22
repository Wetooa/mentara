import { useMemo } from 'react'
import { useTherapistMeetings, useTherapistDashboard } from './therapist/useTherapistDashboard'
import { useMeetings } from './booking/useBooking'
import { useAuth } from '@/contexts/AuthContext'

// Enhanced meeting data interface for calendar display
export interface CalendarMeeting {
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

/**
 * Hook for getting meeting data formatted for calendar display
 * Supports both therapist and client views
 */
export function useCalendarMeetings(params: {
  status?: string
  limit?: number
  offset?: number
} = {}) {
  const { user } = useAuth()
  
  // Get meeting data based on user role
  const therapistMeetingsQuery = useTherapistMeetings(params)
  const clientMeetingsQuery = useMeetings(params)
  const dashboardQuery = useTherapistDashboard()
  
  // Determine which query to use based on user role
  const isTherapist = user?.role === 'therapist'
  const meetingsQuery = isTherapist ? therapistMeetingsQuery : clientMeetingsQuery
  
  // Transform meeting data for calendar display
  const calendarMeetings = useMemo((): CalendarMeeting[] => {
    if (!meetingsQuery.data) return []
    
    const meetings = Array.isArray(meetingsQuery.data) 
      ? meetingsQuery.data 
      : meetingsQuery.data.meetings || []
    
    return meetings.map((meeting: any): CalendarMeeting => {
      // Extract meeting data with fallbacks
      const startTime = meeting.startTime || meeting.date || meeting.scheduledAt
      const endTime = meeting.endTime || meeting.endDate || 
        (startTime && meeting.duration 
          ? new Date(new Date(startTime).getTime() + (meeting.duration * 60000)).toISOString()
          : startTime)
      
      // Handle different data structures from different endpoints
      const therapistName = meeting.therapist?.name || 
                           meeting.therapist?.firstName + ' ' + meeting.therapist?.lastName ||
                           meeting.therapistName
                           
      const clientName = meeting.client?.name ||
                        meeting.client?.firstName + ' ' + meeting.client?.lastName ||
                        meeting.clientName ||
                        meeting.user?.name ||
                        meeting.user?.firstName + ' ' + meeting.user?.lastName
      
      return {
        id: meeting.id,
        title: meeting.title || meeting.name || 'Therapy Session',
        startTime,
        endTime,
        status: meeting.status?.toUpperCase() || 'SCHEDULED',
        therapistId: meeting.therapistId || meeting.therapist?.id,
        therapistName,
        clientId: meeting.clientId || meeting.client?.id || meeting.userId || meeting.user?.id,
        clientName,
        meetingUrl: meeting.meetingUrl || meeting.roomUrl,
        notes: meeting.notes || meeting.description,
      }
    })
  }, [meetingsQuery.data])
  
  // Also get meetings from dashboard data if available (for therapists)
  const dashboardMeetings = useMemo((): CalendarMeeting[] => {
    if (!isTherapist || !dashboardQuery.data) return []
    
    const dashboardData = dashboardQuery.data
    const meetings = dashboardData.upcomingMeetings || 
                    dashboardData.meetings || 
                    dashboardData.appointments || []
    
    return meetings.map((meeting: any): CalendarMeeting => ({
      id: meeting.id,
      title: meeting.title || 'Therapy Session',
      startTime: meeting.startTime || meeting.scheduledAt || meeting.date,
      endTime: meeting.endTime || meeting.endDate ||
        (meeting.startTime && meeting.duration
          ? new Date(new Date(meeting.startTime).getTime() + (meeting.duration * 60000)).toISOString()
          : meeting.startTime),
      status: meeting.status?.toUpperCase() || 'SCHEDULED',
      therapistId: meeting.therapistId,
      therapistName: meeting.therapistName || user?.firstName + ' ' + user?.lastName,
      clientId: meeting.clientId || meeting.userId,
      clientName: meeting.clientName || 
                 meeting.client?.firstName + ' ' + meeting.client?.lastName ||
                 meeting.user?.firstName + ' ' + meeting.user?.lastName,
      meetingUrl: meeting.meetingUrl || meeting.roomUrl,
      notes: meeting.notes || meeting.description,
    }))
  }, [dashboardQuery.data, isTherapist, user])
  
  // Combine and deduplicate meetings
  const allMeetings = useMemo(() => {
    const combined = [...calendarMeetings, ...dashboardMeetings]
    const seen = new Set()
    
    return combined.filter(meeting => {
      if (seen.has(meeting.id)) return false
      seen.add(meeting.id)
      return true
    })
  }, [calendarMeetings, dashboardMeetings])
  
  return {
    meetings: allMeetings,
    isLoading: meetingsQuery.isLoading || (isTherapist && dashboardQuery.isLoading),
    error: meetingsQuery.error || (isTherapist && dashboardQuery.error),
    refetch: () => {
      meetingsQuery.refetch()
      if (isTherapist && dashboardQuery.refetch) {
        dashboardQuery.refetch()
      }
    },
  }
}

/**
 * Hook for getting meetings for a specific date range
 */
export function useCalendarMeetingsDateRange(startDate: Date, endDate: Date) {
  const { meetings, isLoading, error, refetch } = useCalendarMeetings()
  
  const filteredMeetings = useMemo(() => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.startTime)
      return meetingDate >= startDate && meetingDate <= endDate
    })
  }, [meetings, startDate, endDate])
  
  return {
    meetings: filteredMeetings,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook for getting meetings for a specific date
 */
export function useCalendarMeetingsForDate(date: Date) {
  const { meetings, isLoading, error, refetch } = useCalendarMeetings()
  
  const dayMeetings = useMemo(() => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.startTime)
      return meetingDate.toDateString() === date.toDateString()
    })
  }, [meetings, date])
  
  return {
    meetings: dayMeetings,
    isLoading,
    error,
    refetch,
  }
}