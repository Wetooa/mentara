"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
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

interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  duration: number;
  meetingUrl?: string;
  notes?: string;
  client?: {
    userId: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      profilePicture?: string;
    };
  };
  therapist?: {
    userId: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      profilePicture?: string;
    };
    specialization?: string;
  };
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
    },
  },
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
        const waitingMeetings = meetingsArray.filter(meeting => meeting.status === "WAITING");
        return waitingMeetings.length;
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
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-white"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Enhanced Page Header */}
        <motion.div
          variants={headerVariants}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Schedule Management
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">
              Comprehensive practice management and session coordination
            </p>
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

        {/* Enhanced Tab Navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-14 p-1 bg-white/80 backdrop-blur border shadow-sm">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all duration-200"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
              {getTabBadgeCount("overview") > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                  {getTabBadgeCount("overview")}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="flex items-center gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all duration-200"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Schedule</span>
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="flex items-center gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all duration-200"
            >
              <Inbox className="h-4 w-4" />
              <span className="hidden sm:inline">Requests</span>
              {getTabBadgeCount("requests") > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 min-w-5 text-xs">
                  {getTabBadgeCount("requests")}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all duration-200"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger
              value="availability"
              className="flex items-center gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all duration-200"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Availability</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Today's Sessions & Quick Stats */}
          <TabsContent value="overview" className="space-y-6 pt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <UpcomingSessionsToday
                meetings={meetingsArray}
                onMeetingUpdate={handleMeetingUpdate}
              />
            </motion.div>
          </TabsContent>

          {/* Schedule Tab - Google Calendar View */}
          <TabsContent value="schedule" className="space-y-6 pt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="h-[calc(100vh-280px)] min-h-[600px] max-h-[900px]"
            >
              <GoogleCalendarView
                meetings={meetingsArray}
                onMeetingClick={handleMeetingClick}
                className="h-full"
              />
            </motion.div>
          </TabsContent>

          {/* Booking Requests Tab */}
          <TabsContent value="requests" className="space-y-6 pt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <BookingRequestsTab />
            </motion.div>
          </TabsContent>

          {/* Analytics Tab - Revenue & Performance Dashboard */}
          <TabsContent value="analytics" className="space-y-6 pt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <TherapistAnalyticsDashboard />
            </motion.div>
          </TabsContent>

          {/* Availability Management Tab */}
          <TabsContent value="availability" className="space-y-6 pt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <TherapistAvailabilityCalendar />
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Meeting Details Sheet */}
        <MeetingDetailsSheet
          meeting={selectedMeeting}
          isOpen={isMeetingSheetOpen}
          onClose={() => {
            setIsMeetingSheetOpen(false);
            setSelectedMeeting(null);
          }}
          onMeetingUpdate={handleMeetingUpdate}
        />
      </div>
    </motion.div>
  );
}