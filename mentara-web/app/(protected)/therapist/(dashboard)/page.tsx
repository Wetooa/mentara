"use client";

import TherapistDashboardHeader from "@/components/therapist/dashboard/TherapistDashboardHeader";
import DashboardOverview from "@/components/therapist/dashboard/DashboardOverview";
import DashboardPatientList from "@/components/therapist/dashboard/DashboardPatientList";
import DashboardStats from "@/components/therapist/dashboard/DashboardStats";
import { MatchedClientsSection } from "@/components/therapist/dashboard/MatchedClientsSection";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTherapistDashboard } from "@/hooks/therapist/useTherapistDashboard";
import { useRecentCommunications } from "@/hooks/dashboard/useClientDashboard";
import {
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getInitials } from "@/lib/utils/common";
import { formatDistanceToNow } from "date-fns";

export default function TherapistDashboardPage() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useTherapistDashboard();
  const { data: recentChats = [], isLoading: isChatsLoading } = useRecentCommunications();

  // Destructure from updated backend response structure
  const therapist = data?.therapist;
  const patients = data?.patients;
  const schedule = data?.schedule;
  const earnings = data?.earnings;
  const performance = data?.performance;

  // Navigation handlers for clickable dashboard elements
  const handlePatientsClick = () => {
    router.push("/therapist/patients");
  };

  const handleScheduleClick = () => {
    router.push("/therapist/schedule");
  };

  const handleMessagesClick = () => {
    router.push("/therapist/messages");
  };

  const handleCommunityClick = () => {
    router.push("/therapist/community");
  };

  const handleWorksheetsClick = () => {
    router.push("/therapist/worksheets");
  };

  const handleRetry = () => {
    refetch();
  };

  const handleChatClick = (contactId: string) => {
    router.push(`/therapist/messages?contact=${contactId}`);
  };

  // Enhanced error state with retry functionality
  if (error && !isLoading) {
    return (
      <div className="w-full h-full p-6 space-y-8">
        <Alert className="max-w-md mx-auto border-secondary/30 bg-secondary/10">
          <AlertCircle className="h-4 w-4 text-secondary" />
          <AlertDescription className="flex items-center justify-between text-gray-900">
            <span>Failed to load dashboard data</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="ml-4 border-secondary/30 text-secondary hover:bg-secondary/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Enhanced loading state with skeleton components
  if (isLoading || !data) {
    return (
      <div className="w-full min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
        {/* Loading Header */}
          <div className="space-y-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-96" />
        </div>

        {/* Loading Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>

          {/* Loading Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Primary Column */}
            <div className="xl:col-span-2 space-y-6">
              <Skeleton className="h-12 w-48" />
              <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
            </div>

            {/* Secondary Column */}
          <div className="space-y-6">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="w-full h-full p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-[1600px] mx-auto">
        {/* Page Header - Similar to Client */}
        <TherapistDashboardHeader
          therapist={{
            firstName: therapist?.firstName || "Therapist",
            lastName: therapist?.lastName || "",
            avatarUrl: therapist?.avatarUrl,
            specializations: therapist?.specializations || [],
          }}
          onViewSchedule={handleScheduleClick}
        />

        {/* Stats Overview */}
          <DashboardStats
            stats={{
              activePatients: patients?.active || 0,
              rescheduled: 0, // Not available in new structure
              cancelled: 0, // Not available in new structure
              income: earnings?.thisMonth || 0,
              patientStats: {
                total: patients?.total || 0,
                percentage: 0, // Not available in new structure
                months: 6, // Default to 6 months
              chartData: [] as Array<{ month: string; value: number }>,
            },
            }}
            onPatientsClick={handlePatientsClick}
            onScheduleClick={handleScheduleClick}
            onMessagesClick={handleMessagesClick}
            onWorksheetsClick={handleWorksheetsClick}
          />

        {/* Main Dashboard Content - Optimized layout with 2:1 ratio */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 lg:gap-6 auto-rows-min">
          {/* Row 1: Client Matches (4 cols - 2x larger than This Week), Today's Schedule (2 cols) */}
          <div className="md:col-span-2 lg:col-span-4">
            <Card className="h-full shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UsersIcon className="h-5 w-5 text-secondary" />
                  Client Matches
                </CardTitle>
                <p className="text-sm text-gray-600">Recent connections</p>
              </CardHeader>
              <CardContent>
                <MatchedClientsSection />
              </CardContent>
            </Card>
          </div>

          {(schedule?.today?.length || 0) > 0 && (
            <div className="md:col-span-1 lg:col-span-2">
              <Card className="h-full shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-secondary" />
                    Today's Schedule
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {schedule?.today?.length || 0} appointment
                    {(schedule?.today?.length || 0) !== 1 ? "s" : ""}
                  </p>
                </CardHeader>
                <CardContent>
              <DashboardPatientList
                    appointments={(schedule?.today || [])
                      .slice(0, 3)
                      .map((appointment) => ({
                  id: appointment.id,
                        patientId: appointment.id,
                  patientName: appointment.patientName,
                  patientAvatar: "/avatar-placeholder.png",
                        time: new Date(
                          appointment.startTime
                        ).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                        condition: appointment.type || "Session",
                }))}
              />
                  {(schedule?.today?.length || 0) > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleScheduleClick}
                      className="w-full mt-4 text-secondary hover:bg-secondary/10"
                    >
                      View all {schedule.today.length} appointments
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Row 2: This Week's Schedule (2 cols), Recent Chats (2 cols), Practice Analytics (2 cols) */}
          <div className="md:col-span-1 lg:col-span-2">
            <Card className="h-full shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-secondary" />
                  This Week's Schedule
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {schedule?.thisWeek?.length || 0} upcoming
                </p>
              </CardHeader>
              <CardContent>
                {schedule?.thisWeek && schedule.thisWeek.length > 0 ? (
                  <div className="space-y-3">
                    {schedule.thisWeek.slice(0, 4).map((appointment) => (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 bg-secondary/5 rounded-lg border border-secondary/10 hover:border-secondary/30 hover:shadow-sm transition-all cursor-pointer"
                        onClick={() =>
                          router.push(`/therapist/patients/${appointment.id}`)
                        }
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {appointment.patientName}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {appointment.type}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-xs font-medium text-secondary">
                            {new Date(appointment.startTime).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(appointment.startTime).toLocaleTimeString(
                              "en-US",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {(schedule?.thisWeek?.length || 0) > 4 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleScheduleClick}
                        className="w-full text-secondary hover:bg-secondary/10"
                      >
                        +{schedule.thisWeek.length - 4} more
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No appointments</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1 lg:col-span-2">
            <Card className="h-full shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-secondary" />
                  Recent Chats
                </CardTitle>
                <p className="text-sm text-gray-600">Client messages</p>
              </CardHeader>
              <CardContent>
                {isChatsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 rounded-lg" />
                    ))}
                  </div>
                ) : recentChats.length > 0 ? (
                  <div className="space-y-3">
                    {recentChats.slice(0, 4).map((chat: any) => (
                      <motion.div
                        key={chat.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-3 bg-secondary/5 rounded-lg border border-secondary/10 hover:border-secondary/30 hover:shadow-sm transition-all cursor-pointer"
                        onClick={() => handleChatClick(chat.id)}
                      >
                        <Avatar className="h-10 w-10 ring-2 ring-secondary/20">
                          <AvatarImage src={chat.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-secondary/20 to-secondary/10 text-secondary text-sm font-semibold">
                            {getInitials(chat.name || "User")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {chat.name}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {chat.lastMessage || "No messages yet"}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-gray-500">
                            {chat.time ? formatDistanceToNow(new Date(chat.time), { addSuffix: true }) : ""}
                          </p>
                          {chat.unread > 0 && (
                            <div className="mt-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                              {chat.unread}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={handleMessagesClick}
                      className="w-full border-secondary/30 text-secondary hover:bg-secondary/10"
                    >
                      View All Messages
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No recent messages</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMessagesClick}
                      className="mt-3 text-secondary hover:bg-secondary/10"
                    >
                      View All Messages
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
              </div>

          <div className="md:col-span-1 lg:col-span-2">
            <Card className="h-full shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                  Practice Analytics
                </CardTitle>
                <p className="text-sm text-gray-600">Growth metrics</p>
              </CardHeader>
              <CardContent>
              <DashboardOverview
                patientStats={{
                  total: patients?.total || 0,
                    percentage: 0,
                    months: 6,
                    chartData: [],
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-8" />
      </div>
    </div>
  );
}
