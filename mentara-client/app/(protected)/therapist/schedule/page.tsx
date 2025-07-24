"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
// Alert components not used in this page
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  BarChart3,
  Inbox,
  Clock,
  Settings,
  Users,
  TrendingUp,
} from "lucide-react";
import { GoogleCalendarView } from "@/components/calendar-02";
import { MeetingDetailsSheet } from "@/components/MeetingDetailsSheet";
import { BookingRequestsTab } from "@/components/BookingRequestsTab";
import { TherapistAnalyticsDashboard } from "@/components/TherapistAnalyticsDashboard";
import { UpcomingSessionsToday } from "@/components/UpcomingSessionsToday";
import { TherapistAvailabilityCalendar } from "@/components/therapist/TherapistAvailabilityCalendar";
import { useMeetings, useBookingRequests } from "@/hooks/booking/useBooking";
import { toast } from "sonner";

// Animation variants
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 }
  }
};

export default function TherapistSchedulePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isMeetingSheetOpen, setIsMeetingSheetOpen] = useState(false);

  // Get meetings data
  const { meetings, isLoading: meetingsLoading, refetch: refetchMeetings } = useMeetings({
    limit: 100,
  });

  // Get booking requests data
  const { bookingRequests } = useBookingRequests();

  const meetingsArray = Array.isArray(meetings) ? meetings : meetings?.meetings || [];

  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsMeetingSheetOpen(true);
  };

  const handleMeetingUpdate = (updatedMeeting: Meeting) => {
    setSelectedMeeting(updatedMeeting);
    refetchMeetings();
    toast.success("Meeting updated successfully");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const getTabBadgeCount = (tab: string) => {
    switch (tab) {
      case "requests":
        return bookingRequests?.length || 0;
      case "overview":
        const todayMeetings = meetingsArray.filter((meeting) => {
          try {
            const today = new Date();
            const meetingDate = new Date(meeting.startTime);
            return (
              meetingDate.toDateString() === today.toDateString() &&
              (meeting.status === "SCHEDULED" || meeting.status === "CONFIRMED")
            );
          } catch {
            return false;
          }
        });
        return todayMeetings.length;
      default:
        return null;
    }
  };

  return (
    <motion.div 
      className="container mx-auto p-6 space-y-6"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Schedule Management</h1>
          <p className="text-slate-600">
            Manage your therapy sessions and availability
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            onClick={() => setActiveTab("availability")} 
            className="bg-blue-600 hover:bg-blue-700 hover:shadow-lg transition-all duration-300"
          >
            <motion.div
              animate={{ rotate: activeTab === "availability" ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Settings className="h-4 w-4 mr-2" />
            </motion.div>
            Manage Availability
          </Button>
        </motion.div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
          <TabsTrigger value="schedule">Today&apos;s Schedule</TabsTrigger>
          <TabsTrigger value="availability">Manage Availability</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="upcoming">All Upcoming</TabsTrigger>
        </TabsList>

        {/* Today&apos;s Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Date Selector and Stats */}
            <motion.div className="lg:col-span-1" variants={cardVariants}>
              <Card className="bg-gradient-to-br from-blue-50 to-slate-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
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
                    className="rounded-md border border-blue-200 w-full"
                  />
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="mt-4 border-slate-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">Today&apos;s Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Sessions</span>
                    <span className="font-semibold text-blue-900">{todaysMeetings.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Available Slots</span>
                    <span className="font-semibold text-blue-900">{timeSlots.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Revenue</span>
                    <span className="font-semibold text-blue-900">$320</span> {/* Placeholder */}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Today's Meetings - Now spans 3 columns for full width */}
            <motion.div className="lg:col-span-3" variants={cardVariants}>
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
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
                    <div className="text-center py-8">
                      <div className="rounded-full bg-blue-100 p-6 mb-4 mx-auto w-fit">
                        <Calendar className="h-12 w-12 text-blue-600" />
                      </div>
                      <p className="text-slate-600">No sessions scheduled for this date</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todaysMeetings.map((meeting) => (
                        <Card key={meeting.id} className="border border-slate-200 hover:border-blue-300 transition-colors duration-200">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="p-2 rounded-full bg-blue-100">
                                    {getMeetingTypeIcon()}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-blue-900">
                                      {meeting.title || "Therapy Session"}
                                    </h3>
                                    <div className="text-sm text-slate-600">
                                      with {meeting.client?.user.firstName} {meeting.client?.user.lastName}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-blue-600" />
                                    {new Date(meeting.startTime).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })} ({meeting.duration} min)
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3 text-blue-600" />
                                    Client ID: {meeting.clientId?.slice(-6) || 'N/A'}
                                  </div>
                                </div>

                                {meeting.description && (
                                  <p className="mt-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-md">
                                    {meeting.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                {getStatusBadge(meeting.status as unknown as MeetingStatus)}
                                
                                <div className="flex gap-1">
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  </motion.div>
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </motion.div>
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleCancelMeeting(meeting.id)}
                                      disabled={isCancelling}
                                      className="hover:bg-red-50 hover:border-red-300 text-red-600 hover:shadow-md transition-all duration-200"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </motion.div>
                                </div>

                                {meeting.status === 'scheduled' && (
                                  <Button 
                                    size="sm"
                                    onClick={() => handleUpdateMeetingStatus(meeting.id, MeetingStatus.CONFIRMED)}
                                    disabled={isUpdating}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    Confirm
                                  </Button>
                                )}

                                {meeting.status === 'confirmed' && (
                                  <Button 
                                    size="sm"
                                    onClick={() => handleUpdateMeetingStatus(meeting.id, MeetingStatus.IN_PROGRESS)}
                                    disabled={isUpdating}
                                    className="bg-green-600 hover:bg-green-700"
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
            </motion.div>
          </div>
          <div className="flex items-center gap-3">
            {bookingRequests?.length > 0 && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                onClick={() => setActiveTab("requests")}
                className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-800 rounded-lg cursor-pointer"
              >
                <Inbox className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {bookingRequests.length} Pending Request{bookingRequests.length !== 1 ? "s" : ""}
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Availability Management Tab */}
        <TabsContent value="availability" className="space-y-6">
          <TherapistAvailabilityCalendar />
        </TabsContent>

        {/* Calendar View Tab - Full Width */}
        <TabsContent value="calendar" className="space-y-6">
          <div className="w-full">
            <MeetingCalendar
              title="Schedule Calendar"
              showHeader={true}
              showStats={true}
              hoverDelay={3000}
              onDateSelect={(date) => {
                setSelectedDate(date);
                setActiveTab("schedule");
              }}
              className="w-full"
            />
          </div>
        </TabsContent>

        {/* All Upcoming Tab */}
        <TabsContent value="upcoming" className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
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
                <div className="text-center py-8">
                  <div className="rounded-full bg-blue-100 p-6 mb-4 mx-auto w-fit">
                    <Calendar className="h-12 w-12 text-blue-600" />
                  </div>
                  <p className="text-slate-600">No upcoming sessions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingMeetings.map((meeting) => (
                    <Card key={meeting.id} className="border border-slate-200 hover:border-blue-300 transition-colors duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-blue-100">
                              {getMeetingTypeIcon()}
                            </div>
                            <div>
                              <div className="font-semibold text-blue-900">
                                {meeting.title || "Therapy Session"}
                              </div>
                              <div className="text-sm text-slate-600">
                                with {meeting.client?.user.firstName} {meeting.client?.user.lastName}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-sm text-slate-600 text-right">
                              <div className="font-medium">{new Date(meeting.startTime).toLocaleDateString()}</div>
                              <div className="text-blue-600">
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
    </motion.div>
  );
}