"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useDashboardData,
  useRecentCommunications,
} from "@/hooks/dashboard/useClientDashboard";
import {
  transformDashboardData,
} from "@/lib/transformers/dashboardTransformer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsOverview from "@/components/dashboard/StatsOverview";
import UpcomingSessions from "@/components/dashboard/UpcomingSessions";
import UpcomingSessionsCalendar from "@/components/dashboard/UpcomingSessionsCalendar";
import WorksheetStatus from "@/components/dashboard/WorksheetStatus";
import ProgressTracking from "@/components/dashboard/ProgressTracking";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import AssignedTherapist from "@/components/dashboard/AssignedTherapist";
import RecentCommunications from "@/components/dashboard/RecentCommunications";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();

  // Fetch data from backend APIs
  const {
    data: dashboardApiData,
    isLoading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useDashboardData();


  const { data: communicationsData, isLoading: isCommunicationsLoading } =
    useRecentCommunications();

  // Transform backend data to frontend format
  const dashboardData = useMemo(() => {
    if (!dashboardApiData) {
      return null;
    }

    // DEBUG: Log raw API data to trace dateString.split error
    console.log('🔍 Dashboard API Data:', {
      dashboardApiData: JSON.stringify(dashboardApiData, null, 2),
      communicationsData: JSON.stringify(communicationsData, null, 2),
    });

    try {
      const transformedData = transformDashboardData(
        dashboardApiData,
        Array.isArray(communicationsData) ? communicationsData : []
      );

      console.log('✅ Dashboard data transformed successfully:', transformedData);
      return transformedData;
    } catch (error) {
      console.error('❌ Error transforming dashboard data:', error);
      console.error('❌ Error stack:', error.stack);
      throw error; // Re-throw to trigger error boundary
    }
  }, [dashboardApiData, communicationsData]);

  const isLoading =
    isDashboardLoading || isCommunicationsLoading;

  const handleMessageTherapist = () => {
    router.push('/client/messages');
  };

  const handleScheduleSession = () => {
    router.push('/client/booking');
  };

  const handleViewAllMessages = () => {
    router.push('/client/messages');
  };

  const handleContactSelect = (contactId: string) => {
    router.push(`/client/messages?contact=${contactId}`);
  };

  const handleBookSession = () => {
    router.push('/client/booking');
  };

  const handleRetry = () => {
    refetchDashboard();
  };

  // Navigation handlers for clickable dashboard cards
  const handleUpcomingSessionsClick = () => {
    router.push('/client/sessions/upcoming');
  };

  const handlePendingWorksheetsClick = () => {
    router.push('/client/worksheets');
  };

  const handleCompletedSessionsClick = () => {
    router.push('/client/sessions/completed');
  };

  const handleCompletedWorksheetsClick = () => {
    router.push('/client/worksheets?filter=completed');
  };

  const handleTherapistsClick = () => {
    router.push('/client/therapist');
  };

  // Show error state
  if (dashboardError && !isLoading) {
    return (
      <div className="w-full h-full p-6 space-y-8">
        <Alert className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load dashboard data</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show loading state for first load or when no data
  if (isLoading || !dashboardData) {
    return (
      <div className="w-full h-full p-6 space-y-8">
        {/* Loading Header */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Loading Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>

        {/* Loading Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Ensure we have dashboard data before rendering
  if (!dashboardData) {
    return null;
  }

  return (
    <div className="w-full h-full p-6 space-y-8">
      {/* Page Header */}
      <DashboardHeader
        user={dashboardData.user}
        onBookSession={handleBookSession}
      />

      {/* Stats Overview */}
      <StatsOverview
        stats={dashboardData.stats}
        onUpcomingSessionsClick={handleUpcomingSessionsClick}
        onPendingWorksheetsClick={handlePendingWorksheetsClick}
        onCompletedSessionsClick={handleCompletedSessionsClick}
        onCompletedWorksheetsClick={handleCompletedWorksheetsClick}
        onTherapistsClick={handleTherapistsClick}
      />

      {/* Main Dashboard Content - Responsive layout with calendar prominence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Primary Column - Full-Width Sessions Calendar */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          {/* Sessions Calendar - Full Width Modern Design */}
          {/* <UpcomingSessionsCalendar className="h-full" /> */}

          {/* Secondary Content - Sessions and Worksheets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <UpcomingSessions sessions={dashboardData.upcomingSessions} />
            <WorksheetStatus worksheets={dashboardData.worksheets} />
          </div>
        </div>

        {/* Right Sidebar - Therapist, Communications, Progress, and Notifications */}
        <div className="space-y-4 lg:space-y-6">
          <AssignedTherapist
            assignedTherapists={dashboardApiData?.assignedTherapists || []}
            isLoading={isDashboardLoading}
            onMessageTherapist={handleMessageTherapist}
            onScheduleSession={handleScheduleSession}
          />
          <RecentCommunications
            recentContacts={dashboardData.recentCommunications}
            onViewAllMessages={handleViewAllMessages}
            onContactSelect={handleContactSelect}
          />
          <ProgressTracking progress={dashboardData.progress} />
          <NotificationCenter 
            className="h-96" 
            showSettings={false} 
            maxHeight="384px" 
          />
        </div>
      </div>
    </div>
  );
}
