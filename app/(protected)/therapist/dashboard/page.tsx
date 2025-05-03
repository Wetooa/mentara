"use client";

import React from "react";
import DashboardGreeting from "@/components/therapist/dashboard/DashboardGreeting";
import DashboardStats from "@/components/therapist/dashboard/DashboardStats";
import DashboardPatientList from "@/components/therapist/dashboard/DashboardPatientList";
import DashboardOverview from "@/components/therapist/dashboard/DashboardOverview";
import { useTherapistData } from "@/hooks/useTherapistData";

export default function TherapistDashboardPage() {
  const { therapist, stats, upcomingAppointments, isLoading, error } =
    useTherapistData();

  if (isLoading) {
    return <div className="p-6">Loading dashboard data...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error loading dashboard: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6">
      <DashboardGreeting name={therapist.name} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-4">Today's agenda</h2>
            <DashboardStats stats={stats} />
          </div>

          <div>
            <h2 className="text-lg font-medium mb-4">
              Today's upcoming patients ({upcomingAppointments.length})
            </h2>
            <DashboardPatientList appointments={upcomingAppointments} />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4">Overview</h2>
          <DashboardOverview patientStats={stats.patientStats} />
        </div>
      </div>
    </div>
  );
}
