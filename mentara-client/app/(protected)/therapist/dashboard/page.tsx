"use client";

import React from "react";
import DashboardGreeting from "@/components/therapist/dashboard/DashboardGreeting";
import DashboardStats from "@/components/therapist/dashboard/DashboardStats";
import DashboardPatientList from "@/components/therapist/dashboard/DashboardPatientList";
import DashboardOverview from "@/components/therapist/dashboard/DashboardOverview";
import { MatchedClientsSection } from "@/components/therapist/dashboard/MatchedClientsSection";
import { DashboardCalendarWidget } from "@/components/therapist/dashboard/DashboardCalendarWidget";
import { useTherapistDashboard } from "@/hooks/useTherapistDashboard";

export default function TherapistDashboardPage() {
  const { data, isLoading, error } = useTherapistDashboard();
  
  // Destructure from data object for backward compatibility
  const therapist = data?.therapist;
  const stats = data?.stats;
  const upcomingAppointments = data?.upcomingAppointments || [];

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
      <DashboardGreeting name={therapist?.name || 'Therapist'} />

      {/* Matched Clients Section - High Priority */}
      <div className="mt-8">
        <h2 className="text-lg font-medium mb-4">Client Matches & Requests</h2>
        <MatchedClientsSection />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-4">Today&apos;s agenda</h2>
            <DashboardStats stats={stats || {
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
            }} />
          </div>

          <div>
            <h2 className="text-lg font-medium mb-4">
              Today&apos;s upcoming patients ({upcomingAppointments.length})
            </h2>
            <DashboardPatientList appointments={upcomingAppointments.map(apt => ({
              ...apt,
              patientAvatar: "/avatar-placeholder.png",
              condition: "General consultation"
            }))} />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-4">Overview</h2>
            <DashboardOverview patientStats={stats?.patientStats || {
              total: 0,
              percentage: 0,
              months: 0,
              chartData: []
            }} />
          </div>
          
          <DashboardCalendarWidget />
        </div>
      </div>
    </div>
  );
}
