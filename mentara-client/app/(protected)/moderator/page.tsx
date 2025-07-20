"use client";

import React from "react";
import { ModerationStats } from "@/components/moderator";
import { useModeratorDashboard, useRefreshModeratorDashboard } from "@/hooks/useModeratorDashboard";

export default function ModeratorDashboard() {
  const { data: stats, isLoading } = useModeratorDashboard();
  const refreshDashboard = useRefreshModeratorDashboard();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Moderator Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor platform activity and manage content moderation
        </p>
      </div>

      <ModerationStats 
        stats={stats}
        isLoading={isLoading}
        onRefresh={refreshDashboard}
      />
    </div>
  );
}