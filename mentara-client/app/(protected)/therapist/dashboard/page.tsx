"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DashboardGreeting from "@/components/therapist/dashboard/DashboardGreeting";
import DashboardStats from "@/components/therapist/dashboard/DashboardStats";
import DashboardPatientList from "@/components/therapist/dashboard/DashboardPatientList";
import DashboardOverview from "@/components/therapist/dashboard/DashboardOverview";
import { MatchedClientsSection } from "@/components/therapist/dashboard/MatchedClientsSection";
import { DashboardCalendarWidget } from "@/components/therapist/dashboard/DashboardCalendarWidget";
import { useTherapistDashboard } from "@/hooks/therapist/useTherapistDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TherapistDashboardPage() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useTherapistDashboard();

  // Destructure from data object for backward compatibility
  const therapist = data?.therapist;
  const stats = data?.stats;
  const upcomingAppointments = data?.upcomingAppointments || [];

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
        <Alert className="max-w-md mx-auto border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="flex items-center justify-between text-amber-800">
            <span>Failed to load dashboard data</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="ml-4 border-amber-300 text-amber-700 hover:bg-amber-100"
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
      <div className="w-full h-full p-6 space-y-8">
        {/* Loading Header */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-64 bg-amber-100" />
          <Skeleton className="h-4 w-96 bg-amber-50" />
        </div>

        {/* Loading Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 bg-amber-100" />
          ))}
        </div>

        {/* Loading Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 bg-amber-100" />
            <Skeleton className="h-64 bg-amber-100" />
          </div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 bg-amber-100" />
            ))}
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 bg-amber-100" />
            <Skeleton className="h-48 bg-amber-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 space-y-8">
      {/* Page Header */}
      <DashboardGreeting name={therapist?.name || 'Therapist'} />

      {/* Matched Clients Section - High Priority */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-amber-800">Client Matches</h2>
        <MatchedClientsSection />
      </div>

      {/* Stats Overview */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-amber-800">Today&apos;s Agenda</h2>
        <DashboardStats
          stats={stats || {
            activePatients: 0,
            rescheduled: 0,
            cancelled: 0,
            income: 0,
            patientStats: {
              total: 0,
              percentage: 0,
              months: 0,
              chartData: [] as Array<{ month: string; value: number }>
            }
          }}
          onPatientsClick={handlePatientsClick}
          onScheduleClick={handleScheduleClick}
          onMessagesClick={handleMessagesClick}
          onWorksheetsClick={handleWorksheetsClick}
        />
      </div>

      {/* Main Dashboard Content - Modern 4-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Sessions and Patients */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-4 text-amber-800">
              Today&apos;s Upcoming Patients ({upcomingAppointments.length})
            </h2>
            <DashboardPatientList
              appointments={upcomingAppointments.map(apt => ({
                ...apt,
                patientAvatar: "/avatar-placeholder.png",
                condition: "General consultation"
              }))}
              onPatientClick={handlePatientsClick}
              onScheduleClick={handleScheduleClick}
            />
          </div>
        </div>

        {/* Right Column 1 - Overview and Analytics */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-4 text-amber-800">Overview</h2>
            <DashboardOverview
              patientStats={stats?.patientStats || {
                total: 0,
                percentage: 0,
                months: 0,
                chartData: []
              }}
              onPatientsClick={handlePatientsClick}
            />
          </div>
        </div>

        {/* Right Column 2 - Calendar and Quick Actions */}
        {/* <div className="space-y-6"> */}
        {/*   <div> */}
        {/*     <h2 className="text-lg font-medium mb-4 text-amber-800">Schedule</h2> */}
        {/*     <DashboardCalendarWidget */}
        {/*       onDateClick={handleScheduleClick} */}
        {/*       onViewSchedule={handleScheduleClick} */}
        {/*     /> */}
        {/*   </div> */}
        {/* </div> */}
      </div>
    </div>
  );
}
