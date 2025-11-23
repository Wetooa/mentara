"use client";

import { useMemo, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  useDashboardData,
  useRecentCommunications,
} from "@/hooks/dashboard/useClientDashboard";
import { transformDashboardData } from "@/lib/transformers/dashboardTransformer";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

// Lazy load dashboard components
const DashboardHeader = dynamic(() => import("@/components/dashboard/DashboardHeader").then(mod => ({ default: mod.default })), {
  loading: () => <Skeleton className="h-10 w-64" />
});

const StatsOverview = dynamic(() => import("@/components/dashboard/StatsOverview").then(mod => ({ default: mod.default })), {
  loading: () => <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} className="h-28 rounded-xl" />
    ))}
  </div>
});

const UpcomingSessions = dynamic(() => import("@/components/dashboard/UpcomingSessions").then(mod => ({ default: mod.default })), {
  loading: () => <Skeleton className="h-80 rounded-xl" />
});

const WorksheetStatus = dynamic(() => import("@/components/dashboard/WorksheetStatus").then(mod => ({ default: mod.default })), {
  loading: () => <Skeleton className="h-80 rounded-xl" />
});

const ProgressTracking = dynamic(() => import("@/components/dashboard/ProgressTracking").then(mod => ({ default: mod.default })), {
  loading: () => <Skeleton className="h-64 rounded-xl" />
});

const AssignedTherapist = dynamic(() => import("@/components/dashboard/AssignedTherapist").then(mod => ({ default: mod.default })), {
  loading: () => <Skeleton className="h-80 rounded-xl" />
});

const RecentCommunications = dynamic(() => import("@/components/dashboard/RecentCommunications").then(mod => ({ default: mod.default })), {
  loading: () => <Skeleton className="h-64 rounded-xl" />
});

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

    // Log raw API data in development only
    logger.debug("🔍 [Client Dashboard] API Data:", {
      dashboardApiData: JSON.stringify(dashboardApiData, null, 2),
      communicationsData: JSON.stringify(communicationsData, null, 2),
    });

    try {
      const transformedData = transformDashboardData(
        dashboardApiData,
        Array.isArray(communicationsData) ? communicationsData : []
      );

      logger.debug("✅ [Client Dashboard] Data transformed successfully:", transformedData);
      return transformedData;
    } catch (error) {
      logger.error("❌ [Client Dashboard] Error transforming data:", error);
      if (error instanceof Error) {
        logger.error("❌ [Client Dashboard] Error stack:", error.stack);
      }
      throw error; // Re-throw to trigger error boundary
    }
  }, [dashboardApiData, communicationsData]);

  const isLoading = isDashboardLoading || isCommunicationsLoading;

  // Memoize callbacks to prevent unnecessary re-renders
  const handleMessageTherapist = useCallback(() => {
    router.push("/client/messages");
  }, [router]);

  const handleScheduleSession = useCallback(() => {
    router.push("/client/booking");
  }, [router]);

  const handleViewAllMessages = useCallback(() => {
    router.push("/client/messages");
  }, [router]);

  const handleContactSelect = useCallback((contactId: string) => {
    router.push(`/client/messages?contact=${contactId}`);
  }, [router]);

  const handleBookSession = useCallback(() => {
    router.push("/client/booking");
  }, [router]);

  const handleRetry = useCallback(() => {
    refetchDashboard();
  }, [refetchDashboard]);

  // Navigation handlers for clickable dashboard cards
  const handleUpcomingSessionsClick = useCallback(() => {
    router.push("/client/sessions/upcoming");
  }, [router]);

  const handlePendingWorksheetsClick = useCallback(() => {
    router.push("/client/worksheets");
  }, [router]);

  const handleCompletedSessionsClick = useCallback(() => {
    router.push("/client/sessions/completed");
  }, [router]);

  const handleCompletedWorksheetsClick = useCallback(() => {
    router.push("/client/worksheets?filter=completed");
  }, [router]);

  const handleTherapistsClick = useCallback(() => {
    router.push("/client/therapist");
  }, [router]);

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
      <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="w-full h-full p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-[1600px] mx-auto">
          {/* Loading Header */}
          <div className="space-y-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-96" />
          </div>

          {/* Loading Stats - 5 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>

          {/* Loading Main Content - 2 row layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 lg:gap-6">
            {/* Row 1: 3 cards */}
            <div className="md:col-span-1 lg:col-span-2">
              <Skeleton className="h-80 rounded-xl" />
            </div>
            <div className="md:col-span-1 lg:col-span-2">
              <Skeleton className="h-80 rounded-xl" />
            </div>
            <div className="md:col-span-2 lg:col-span-2">
              <Skeleton className="h-80 rounded-xl" />
            </div>

            {/* Row 2: 2 cards */}
            <div className="md:col-span-1 lg:col-span-3">
              <Skeleton className="h-64 rounded-xl" />
            </div>
            <div className="md:col-span-1 lg:col-span-3">
              <Skeleton className="h-64 rounded-xl" />
            </div>
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
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="w-full h-full p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-[1600px] mx-auto">
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

        {/* Main Dashboard Content - Compact 2-row layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 lg:gap-6 auto-rows-min">
          {/* Row 1: Sessions, Worksheets, Therapist (3 cards) */}
          <div className="md:col-span-1 lg:col-span-2">
            <UpcomingSessions sessions={dashboardData.upcomingSessions} />
          </div>

          <div className="md:col-span-1 lg:col-span-2">
            <WorksheetStatus worksheets={dashboardData.worksheets} />
          </div>

          <div className="md:col-span-2 lg:col-span-2">
            <AssignedTherapist
              assignedTherapists={dashboardApiData?.assignedTherapists || []}
              isLoading={isDashboardLoading}
              onMessageTherapist={handleMessageTherapist}
              onScheduleSession={handleScheduleSession}
            />
          </div>

          {/* Row 2: Recent Chats and Wellness Pulse (2 cards) */}
          <div className="md:col-span-1 lg:col-span-3">
            <RecentCommunications
              recentContacts={dashboardData.recentCommunications}
              onViewAllMessages={handleViewAllMessages}
              onContactSelect={handleContactSelect}
            />
          </div>

          <div className="md:col-span-1 lg:col-span-3">
            <ProgressTracking progress={dashboardData.progress} />
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-8" />
      </div>
    </div>
  );
}
