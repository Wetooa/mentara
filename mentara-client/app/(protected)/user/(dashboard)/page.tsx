"use client";

import { useMemo } from "react";
import {
  useDashboardData,
  useNotifications,
  useRecentCommunications,
} from "@/hooks/useDashboard";
import {
  transformDashboardData,
  createFallbackDashboardData,
} from "@/lib/transformers/dashboardTransformer";
import type { UserDashboardData } from "@/lib/api/types/dashboard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsOverview from "@/components/dashboard/StatsOverview";
import UpcomingSessions from "@/components/dashboard/UpcomingSessions";
import WorksheetStatus from "@/components/dashboard/WorksheetStatus";
import ProgressTracking from "@/components/dashboard/ProgressTracking";
import NotificationsCenter from "@/components/dashboard/NotificationsCenter";
import AssignedTherapist from "@/components/dashboard/AssignedTherapist";
import RecentCommunications from "@/components/dashboard/RecentCommunications";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  // Fetch data from backend APIs
  const {
    data: dashboardApiData,
    isLoading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useDashboardData();

  const { data: notificationsData, isLoading: isNotificationsLoading } =
    useNotifications({ limit: 10, isRead: false });

  const { data: communicationsData, isLoading: isCommunicationsLoading } =
    useRecentCommunications();

  // Transform backend data to frontend format
  const dashboardData = useMemo(() => {
    if (!dashboardApiData) {
      return null;
    }

    return transformDashboardData(
      dashboardApiData,
      notificationsData || [],
      communicationsData || []
    );
  }, [dashboardApiData, notificationsData, communicationsData]);

  const isLoading =
    isDashboardLoading || isNotificationsLoading || isCommunicationsLoading;

  const handleMessageTherapist = () => {
    // TODO: Navigate to messages page
    // Navigation functionality to be implemented
  };

  const handleScheduleSession = () => {
    // TODO: Navigate to scheduling page
    // Navigation functionality to be implemented
  };

  const handleViewAllMessages = () => {
    // TODO: Navigate to messages page
    // Navigation functionality to be implemented
  };

  const handleContactSelect = (contactId: string) => {
    // TODO: Navigate to specific conversation
    // Navigation functionality to be implemented
    void contactId; // Acknowledge parameter
  };

  const handleBookSession = () => {
    // TODO: Navigate to booking page
    // Navigation functionality to be implemented
  };

  const handleRetry = () => {
    refetchDashboard();
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
      <StatsOverview stats={dashboardData.stats} />

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <UpcomingSessions sessions={dashboardData.upcomingSessions} />
          <WorksheetStatus worksheets={dashboardData.worksheets} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
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
          <NotificationsCenter notifications={dashboardData.notifications} />
        </div>
      </div>
    </div>
  );
}
