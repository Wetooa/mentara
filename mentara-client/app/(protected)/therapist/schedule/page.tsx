"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
// Alert components not used in this page
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Video,
  User,
  Settings,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { TherapistAvailabilityCalendar } from "@/components/therapist/TherapistAvailabilityCalendar";
import { MeetingCalendar } from "@/components/calendar/MeetingCalendar";
import { useBooking, useMeetings } from "@/hooks/booking/useBooking";
import { useAvailableSlots } from "@/hooks/booking/useAvailableSlots";
import { MeetingStatus } from "@/types/booking";
import { toast } from "sonner";

export default function TherapistSchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("schedule");

  // Format date for API
  const dateString = selectedDate.toISOString().split('T')[0];

  // Get meetings for the selected date
  const { meetings, isLoading: meetingsLoading } = useMeetings({
    limit: 50,
  });

  // Get available slots for the selected date (to show availability)
  const {
    timeSlots,
  } = useAvailableSlots("current-therapist", dateString); // In real app, get current therapist ID

  // Get all upcoming meetings
  const { meetings: allMeetings, isLoading: allMeetingsLoading } = useMeetings({
    status: 'SCHEDULED,CONFIRMED,IN_PROGRESS',
    limit: 20,
  });

  const { updateMeeting, cancelMeeting, isUpdating, isCancelling } = useBooking();

  const handleUpdateMeetingStatus = async (meetingId: string, status: MeetingStatus) => {
    try {
      await updateMeeting(meetingId, { status });
      toast.success("Meeting status updated");
    } catch {
      toast.error("Failed to update meeting status");
    }
  };

  const handleCancelMeeting = async (meetingId: string) => {
    if (confirm("Are you sure you want to cancel this meeting?")) {
      try {
        await cancelMeeting(meetingId);
        toast.success("Meeting cancelled");
      } catch {
        toast.error("Failed to cancel meeting");
      }
    }
  };

  const getStatusBadge = (status: MeetingStatus) => {
    switch (status) {
      case MeetingStatus.SCHEDULED:
        return <Badge variant="secondary">Scheduled</Badge>;
      case MeetingStatus.CONFIRMED:
        return <Badge variant="default">Confirmed</Badge>;
      case MeetingStatus.IN_PROGRESS:
        return <Badge variant="destructive">In Progress</Badge>;
      case MeetingStatus.COMPLETED:
        return <Badge variant="outline">Completed</Badge>;
      case MeetingStatus.CANCELLED:
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMeetingTypeIcon = () => {
    // All meetings are video-only now
    return <Video className="h-4 w-4" />;
  };


  const meetingsArray = Array.isArray(meetings) ? meetings : meetings?.meetings || [];
  const todaysMeetings = meetingsArray?.filter((meeting) => {
    const meetingDate = new Date(meeting.startTime).toDateString();
    return meetingDate === selectedDate.toDateString();
  }) || [];

  const allMeetingsArray = Array.isArray(allMeetings) ? allMeetings : allMeetings?.meetings || [];
  const upcomingMeetings = allMeetingsArray?.filter((meeting) => {
    const meetingDate = new Date(meeting.startTime);
    return meetingDate >= new Date() && 
           (meeting.status === "scheduled" || meeting.status === "confirmed");
  }) || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schedule Management</h1>
          <p className="text-muted-foreground">
            Manage your therapy sessions and availability
          </p>
        </div>
        <Button onClick={() => setActiveTab("availability")}>
          <Settings className="h-4 w-4 mr-2" />
          Manage Availability
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule">Today&apos;s Schedule</TabsTrigger>
          <TabsTrigger value="availability">Manage Availability</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="upcoming">All Upcoming</TabsTrigger>
        </TabsList>

        {/* Today&apos;s Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Date Selector */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Select Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0) - 86400000)}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Today&apos;s Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Sessions</span>
                    <span className="font-medium">{todaysMeetings.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Available Slots</span>
                    <span className="font-medium">{timeSlots.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="font-medium">$320</span> {/* Placeholder */}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today's Meetings */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Sessions for {selectedDate.toLocaleDateString()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {meetingsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                    </div>
                  ) : todaysMeetings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p>No sessions scheduled for this date</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todaysMeetings.map((meeting) => (
                        <Card key={meeting.id} className="border border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  {getMeetingTypeIcon()}
                                  <div>
                                    <h3 className="font-medium">
                                      {meeting.title || "Therapy Session"}
                                    </h3>
                                    <div className="text-sm text-muted-foreground">
                                      with {meeting.client?.user.firstName} {meeting.client?.user.lastName}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(meeting.startTime).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })} ({meeting.duration} min)
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    Client ID: {meeting.clientId?.slice(-6) || 'N/A'}
                                  </div>
                                </div>

                                {meeting.description && (
                                  <p className="mt-2 text-sm text-muted-foreground">
                                    {meeting.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                {getStatusBadge(meeting.status as unknown as MeetingStatus)}
                                
                                <div className="flex gap-1">
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleCancelMeeting(meeting.id)}
                                    disabled={isCancelling}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>

                                {meeting.status === 'scheduled' && (
                                  <Button 
                                    size="sm"
                                    onClick={() => handleUpdateMeetingStatus(meeting.id, MeetingStatus.CONFIRMED)}
                                    disabled={isUpdating}
                                  >
                                    Confirm
                                  </Button>
                                )}

                                {meeting.status === 'confirmed' && (
                                  <Button 
                                    size="sm"
                                    onClick={() => handleUpdateMeetingStatus(meeting.id, MeetingStatus.IN_PROGRESS)}
                                    disabled={isUpdating}
                                  >
                                    Start Session
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Availability Management Tab */}
        <TabsContent value="availability" className="space-y-6">
          <TherapistAvailabilityCalendar />
        </TabsContent>

        {/* Calendar View Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <MeetingCalendar
            title="Schedule Calendar"
            showHeader={true}
            showStats={true}
            hoverDelay={3000}
            onDateSelect={(date) => {
              setSelectedDate(date);
              setActiveTab("schedule");
            }}
            className="max-w-6xl mx-auto"
          />
        </TabsContent>

        {/* All Upcoming Tab */}
        <TabsContent value="upcoming" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                All Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allMeetingsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : upcomingMeetings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>No upcoming sessions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingMeetings.map((meeting) => (
                    <Card key={meeting.id} className="border border-gray-200">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getMeetingTypeIcon()}
                            <div>
                              <div className="font-medium">
                                {meeting.title || "Therapy Session"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {meeting.client?.user.firstName} {meeting.client?.user.lastName}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-sm text-muted-foreground text-right">
                              <div>{new Date(meeting.startTime).toLocaleDateString()}</div>
                              <div>
                                {new Date(meeting.startTime).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                            {getStatusBadge(meeting.status as unknown as MeetingStatus)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}