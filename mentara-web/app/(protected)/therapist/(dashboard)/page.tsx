"use client";

import { Suspense, useCallback } from "react";
import dynamic from "next/dynamic";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTherapistDashboard } from "@/hooks/therapist/useTherapistDashboard";
import { useRecentCommunications } from "@/hooks/dashboard/useClientDashboard";
import {
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Lazy load dashboard components
const TherapistDashboardHeader = dynamic(() => import("@/components/therapist/dashboard/TherapistDashboardHeader").then(mod => ({ default: mod.default })), {
  loading: () => <Skeleton className="h-32 w-full rounded-2xl" />
});

const TherapistStatsOverview = dynamic(() => import("@/components/therapist/dashboard/TherapistStatsOverview").then(mod => ({ default: mod.default })), {
  loading: () => <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
    <Skeleton className="lg:col-span-5 h-28 rounded-xl" />
    <div className="lg:col-span-7 grid grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  </div>
});

const ThisWeeksSchedule = dynamic(() => import("@/components/therapist/dashboard/ThisWeeksSchedule").then(mod => ({ default: mod.default })), {
  loading: () => <Skeleton className="h-80 rounded-xl" />
});

const TherapistRecentCommunications = dynamic(() => import("@/components/therapist/dashboard/TherapistRecentCommunications").then(mod => ({ default: mod.default })), {
  loading: () => <Skeleton className="h-64 rounded-xl" />
});

const PracticeAnalytics = dynamic(() => import("@/components/therapist/dashboard/PracticeAnalytics").then(mod => ({ default: mod.default })), {
  loading: () => <Skeleton className="h-64 rounded-xl" />
});

const MatchedClientsSection = dynamic(() => import("@/components/therapist/dashboard/MatchedClientsSection").then(mod => ({ default: mod.MatchedClientsSection })), {
  loading: () => <Skeleton className="h-64 rounded-xl" />
});

export default function TherapistDashboardPage() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useTherapistDashboard();
  const { data: recentChats = [], isLoading: isChatsLoading } =
    useRecentCommunications();

  // Destructure from updated backend response structure
  const therapist = data?.therapist;
  const patients = data?.patients;
  const schedule = data?.schedule;
  const earnings = data?.earnings;
  const performance = data?.performance;

  // Memoize navigation handlers to prevent unnecessary re-renders
  const handlePatientsClick = useCallback(() => {
    router.push("/therapist/patients");
  }, [router]);

  const handleScheduleClick = useCallback(() => {
    router.push("/therapist/schedule");
  }, [router]);

  const handleMessagesClick = useCallback(() => {
    router.push("/therapist/messages");
  }, [router]);

  const handleCommunityClick = useCallback(() => {
    router.push("/therapist/community");
  }, [router]);

  const handleWorksheetsClick = useCallback(() => {
    router.push("/therapist/worksheets");
  }, [router]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleChatClick = useCallback((contactId: string) => {
    router.push(`/therapist/messages?contact=${contactId}`);
  }, [router]);

  // Enhanced error state with retry functionality
  if (error && !isLoading) {
    return (
      <div className="w-full h-full p-6 space-y-8" role="alert" aria-live="assertive">
        <Alert className="max-w-md mx-auto border-secondary/30 bg-secondary/10">
          <AlertCircle className="h-4 w-4 text-secondary" aria-hidden="true" />
          <AlertDescription className="flex items-center justify-between text-gray-900">
            <span>Failed to load dashboard data</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="ml-4 border-secondary/30 text-secondary hover:bg-secondary/20"
              aria-label="Retry loading dashboard"
            >
              <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Enhanced loading state with skeleton components matching client dashboard
  if (isLoading || !data) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50" aria-live="polite" aria-busy="true">
        <div className="w-full h-full p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-[1600px] mx-auto">
          {/* Loading Header */}
          <div className="space-y-3" aria-label="Loading dashboard header">
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>

          {/* Loading Stats - Asymmetric layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
            <Skeleton className="lg:col-span-5 h-28 rounded-xl" />
            <div className="lg:col-span-7 grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Loading Main Content - 2 row layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 lg:gap-6">
            {/* Row 1: 2 cards */}
            <div className="md:col-span-1 lg:col-span-3">
              <Skeleton className="h-80 rounded-xl" />
            </div>
            <div className="md:col-span-1 lg:col-span-3">
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

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="w-full h-full p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-[1600px] mx-auto">
        {/* Page Header */}
        <header>
          <TherapistDashboardHeader
            therapist={{
              firstName: therapist?.firstName || "Therapist",
              lastName: therapist?.lastName || "",
              avatarUrl: therapist?.avatarUrl,
              specializations: therapist?.specializations || [],
            }}
            onViewSchedule={handleScheduleClick}
            stats={{
              activePatients: patients?.active || 0,
              todayAppointments: schedule?.today?.length || 0,
              practiceGrowth: earnings?.percentageChange || 0,
            }}
          />
        </header>

        {/* Stats Overview */}
        <TherapistStatsOverview
          stats={{
            activePatients: patients?.active || 0,
            todayAppointments: schedule?.today?.length || 0,
            weeklyIncome: Math.round((earnings?.thisMonth || 0) / 4), // Approximate weekly
            pendingMessages: recentChats.filter((chat: any) => chat.unread > 0).length,
            practiceGrowth: earnings?.percentageChange || 0,
          }}
          onPatientsClick={handlePatientsClick}
          onScheduleClick={handleScheduleClick}
          onMessagesClick={handleMessagesClick}
          onIncomeClick={handlePatientsClick}
        />

        {/* Main Dashboard Content - Compact 2-row layout matching client dashboard */}
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 lg:gap-6 auto-rows-min" aria-label="Dashboard content">
          {/* Row 1: Client Matches, This Week's Schedule */}
          <div className="md:col-span-1 lg:col-span-3">
            <MatchedClientsSection />
          </div>

          <div className="md:col-span-1 lg:col-span-3">
            <ThisWeeksSchedule
              appointments={(schedule?.thisWeek || []).map((appointment) => ({
                id: appointment.id,
                patientName: appointment.patientName,
                patientAvatar: undefined,
                startTime: appointment.startTime,
                endTime: undefined,
                type: appointment.type,
                status: undefined,
              }))}
              onViewAll={handleScheduleClick}
            />
          </div>

          {/* Row 2: Recent Chats and Practice Analytics */}
          <div className="md:col-span-1 lg:col-span-3">
            <TherapistRecentCommunications
              recentContacts={recentChats.map((chat: any) => ({
                id: chat.id,
                name: chat.name,
                avatar: chat.avatar,
                lastMessage: typeof chat.lastMessage === 'object' && chat.lastMessage !== null
                  ? chat.lastMessage.content || "No messages yet"
                  : chat.lastMessage || "No messages yet",
                time: typeof chat.lastMessage === 'object' && chat.lastMessage !== null
                  ? chat.lastMessage.time || chat.time
                  : chat.time,
                unread: chat.unreadCount || chat.unread || 0,
                status: chat.status,
              }))}
              onViewAllMessages={handleMessagesClick}
              onContactSelect={handleChatClick}
            />
          </div>

          <div className="md:col-span-1 lg:col-span-3">
            <PracticeAnalytics
              patientStats={{
                total: patients?.total || 0,
                percentage: earnings?.percentageChange || 0,
                months: 6,
                chartData: [],
              }}
              income={earnings ? {
                thisMonth: earnings.thisMonth,
                lastMonth: earnings.lastMonth || 0,
                percentageChange: earnings.percentageChange || 0,
              } : undefined}
              performance={performance ? {
                averageRating: performance.averageRating,
                sessionCompletionRate: performance.sessionCompletionRate,
                responseTime: performance.responseTime,
              } : undefined}
            />
          </div>
        </main>

        {/* Bottom Spacing */}
        <div className="h-8" />
      </div>
    </div>
  );
}
