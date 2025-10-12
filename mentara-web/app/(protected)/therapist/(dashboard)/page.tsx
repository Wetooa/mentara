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
import { useTherapistDashboard } from "@/hooks/therapist/useTherapistDashboard";
import { AlertCircle, RefreshCw, MessageSquare, Calendar as CalendarIcon, Users as UsersIcon, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function TherapistDashboardPage() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useTherapistDashboard();

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

        {/* Main Dashboard Content - Compact 2-row layout like client */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 lg:gap-6 auto-rows-min">
          {/* Row 1: Today's Schedule, Client Matches, Analytics (3 cards) */}
          <div className="md:col-span-1 lg:col-span-2">
            <Card className="h-full shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-secondary" />
                    Today's Schedule
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {schedule?.today?.length || 0} appointment{(schedule?.today?.length || 0) !== 1 ? "s" : ""}
                </p>
              </CardHeader>
              <CardContent>
              <DashboardPatientList
                  appointments={(schedule?.today || []).slice(0, 3).map((appointment) => ({
                  id: appointment.id,
                    patientId: appointment.id,
                  patientName: appointment.patientName,
                  patientAvatar: "/avatar-placeholder.png",
                    time: new Date(appointment.startTime).toLocaleTimeString("en-US", {
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

          <div className="md:col-span-1 lg:col-span-2">
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

          <div className="md:col-span-2 lg:col-span-2">
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

          {/* Row 2: Upcoming Appointments, Quick Actions (2 cards) */}
          <div className="md:col-span-1 lg:col-span-3">
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
                    {schedule.thisWeek.slice(0, 5).map((appointment) => (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 bg-secondary/5 rounded-lg border border-secondary/10 hover:border-secondary/30 hover:shadow-sm transition-all"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{appointment.patientName}</p>
                          <p className="text-sm text-gray-600">{appointment.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-secondary">
                            {new Date(appointment.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(appointment.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={handleScheduleClick}
                      className="w-full border-secondary/30 text-secondary hover:bg-secondary/10"
                    >
                      View Full Schedule
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No appointments this week</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1 lg:col-span-3">
            <Card className="h-full shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-secondary" />
                  Quick Actions
                </CardTitle>
                <p className="text-sm text-gray-600">Common tasks</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={handleMessagesClick}
                    className="h-24 flex flex-col items-center justify-center gap-2 bg-secondary/10 hover:bg-secondary/20 text-secondary border-2 border-secondary/30"
                    variant="outline"
                  >
                    <MessageSquare className="h-6 w-6" />
                    <span className="font-semibold">Messages</span>
                  </Button>
                  <Button
                    onClick={handlePatientsClick}
                    className="h-24 flex flex-col items-center justify-center gap-2 bg-secondary/10 hover:bg-secondary/20 text-secondary border-2 border-secondary/30"
                    variant="outline"
                  >
                    <UsersIcon className="h-6 w-6" />
                    <span className="font-semibold">Clients</span>
                  </Button>
                  <Button
                    onClick={handleWorksheetsClick}
                    className="h-24 flex flex-col items-center justify-center gap-2 bg-secondary/10 hover:bg-secondary/20 text-secondary border-2 border-secondary/30"
                    variant="outline"
                  >
                    <TrendingUp className="h-6 w-6" />
                    <span className="font-semibold">Worksheets</span>
                  </Button>
                  <Button
                    onClick={handleCommunityClick}
                    className="h-24 flex flex-col items-center justify-center gap-2 bg-secondary/10 hover:bg-secondary/20 text-secondary border-2 border-2 border-secondary/30"
                    variant="outline"
                  >
                    <UsersIcon className="h-6 w-6" />
                    <span className="font-semibold">Community</span>
                  </Button>
                </div>
                
                {/* Practice Info */}
                <div className="mt-6 p-4 bg-secondary/5 rounded-xl border border-secondary/20">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-secondary" />
                    Practice Performance
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Completion Rate</p>
                      <p className="text-lg font-bold text-gray-900">{performance?.sessionCompletionRate || 0}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Avg. Rating</p>
                      <p className="text-lg font-bold text-gray-900">{performance?.averageRating || 0}/5</p>
                    </div>
                  </div>
                </div>
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
