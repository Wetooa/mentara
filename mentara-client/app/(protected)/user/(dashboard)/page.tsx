"use client";

import { useState } from "react";
import { mockUserDashboardData } from "@/data/mockUserDashboardData";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsOverview from "@/components/dashboard/StatsOverview";
import UpcomingSessions from "@/components/dashboard/UpcomingSessions";
import WorksheetStatus from "@/components/dashboard/WorksheetStatus";
import ProgressTracking from "@/components/dashboard/ProgressTracking";
import NotificationsCenter from "@/components/dashboard/NotificationsCenter";

export default function DashboardPage() {
  const [dashboardData] = useState(mockUserDashboardData);

  return (
    <div className="w-full h-full p-6 space-y-8">
      {/* Page Header */}
      <DashboardHeader user={dashboardData.user} />

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
          <ProgressTracking progress={dashboardData.progress} />
          <NotificationsCenter notifications={dashboardData.notifications} />
        </div>
      </div>
    </div>
  );
}
