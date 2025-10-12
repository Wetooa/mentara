"use client";

import DashboardGreeting from "@/components/therapist/dashboard/DashboardGreeting";
import DashboardOverview from "@/components/therapist/dashboard/DashboardOverview";
import DashboardPatientList from "@/components/therapist/dashboard/DashboardPatientList";
import DashboardStats from "@/components/therapist/dashboard/DashboardStats";
import { MatchedClientsSection } from "@/components/therapist/dashboard/MatchedClientsSection";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTherapistDashboard } from "@/hooks/therapist/useTherapistDashboard";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

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
    router.push('/therapist/patients');
  };

  const handleScheduleClick = () => {
    router.push('/therapist/schedule');
  };

  const handleMessagesClick = () => {
    router.push('/therapist/messages');
  };

  const handleCommunityClick = () => {
    router.push('/therapist/community');
  };

  const handleWorksheetsClick = () => {
    router.push('/therapist/worksheets');
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
    <div className="w-full min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Page Header */}
        <div className="text-center md:text-left">
          <DashboardGreeting name={therapist ? `${therapist.firstName} ${therapist.lastName}` : 'Therapist'} />
          <p className="text-gray-600 mt-2 text-lg">Manage your client relationships and grow your practice</p>
        </div>

        {/* Matched Clients Section - Primary Focus */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Client Matches</h2>
              <p className="text-gray-600">Your assigned clients and recent connections</p>
            </div>
          </div>
          <MatchedClientsSection />
        </section>

        {/* Stats Overview */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Today's Overview</h2>
            <p className="text-gray-600">Your schedule and practice metrics</p>
          </div>
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
                chartData: [] as Array<{ month: string; value: number }>
              }
            }}
            onPatientsClick={handlePatientsClick}
            onScheduleClick={handleScheduleClick}
            onMessagesClick={handleMessagesClick}
            onWorksheetsClick={handleWorksheetsClick}
          />
        </section>

        {/* Enhanced Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Primary Column - Sessions and Patients */}
          <div className="xl:col-span-2 space-y-6">
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Today's Schedule
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {schedule?.today?.length || 0} appointment{(schedule?.today?.length || 0) !== 1 ? 's' : ''} scheduled
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleScheduleClick}
                  className="border-secondary/30 text-secondary hover:bg-secondary/10"
                >
                  View All
                </Button>
              </div>
              <DashboardPatientList
                appointments={(schedule?.today || []).map(appointment => ({
                  id: appointment.id,
                  patientId: appointment.id, // Using appointment id as patient id
                  patientName: appointment.patientName,
                  patientAvatar: "/avatar-placeholder.png",
                  time: new Date(appointment.startTime).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }),
                  condition: appointment.type || "Session"
                }))}
              />
            </section>
          </div>

          {/* Secondary Column - Analytics and Quick Actions */}
          <div className="space-y-6">
            <section>
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Practice Analytics</h3>
                <p className="text-gray-600 text-sm">Your growth and engagement metrics</p>
              </div>
              <DashboardOverview
                patientStats={{
                  total: patients?.total || 0,
                  percentage: 0, // Not available in new structure
                  months: 6, // Default to 6 months
                  chartData: [] // Not available in new structure, could be added later
                }}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
