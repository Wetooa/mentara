"use client";

import React, { useMemo } from "react";
import { Calendar, Clock, CheckCircle, Filter, Eye, Search, Plus } from "lucide-react";
import { ContextualSidebar } from "@/components/common/ContextualSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface WorksheetsSidebarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  therapistFilter: string;
  setTherapistFilter: (therapist: string) => void;
  worksheetCounts?: {
    everything?: number;
    upcoming?: number;
    pastDue?: number;
    completed?: number;
    reviewed?: number;
  };
  onCreateNew?: () => void;
}

export default function WorksheetsSidebar({
  activeFilter,
  setActiveFilter,
  therapistFilter,
  setTherapistFilter,
  worksheetCounts,
  onCreateNew,
}: WorksheetsSidebarProps) {
  const sidebarItems = useMemo(
    () => [
      {
        id: "everything",
        label: "Everything",
        icon: <Filter className="h-4 w-4" />,
        badge: worksheetCounts?.everything,
        onClick: () => setActiveFilter("everything"),
        isActive: activeFilter === "everything",
      },
      {
        id: "upcoming",
        label: "Upcoming",
        icon: <Calendar className="h-4 w-4" />,
        badge: worksheetCounts?.upcoming,
        onClick: () => setActiveFilter("upcoming"),
        isActive: activeFilter === "upcoming",
      },
      {
        id: "past_due",
        label: "Past Due",
        icon: <Clock className="h-4 w-4" />,
        badge: worksheetCounts?.pastDue,
        onClick: () => setActiveFilter("past_due"),
        isActive: activeFilter === "past_due",
      },
      {
        id: "completed",
        label: "Completed",
        icon: <CheckCircle className="h-4 w-4" />,
        badge: worksheetCounts?.completed,
        onClick: () => setActiveFilter("completed"),
        isActive: activeFilter === "completed",
      },
      {
        id: "reviewed",
        label: "Reviewed",
        icon: <Eye className="h-4 w-4" />,
        badge: worksheetCounts?.reviewed,
        onClick: () => setActiveFilter("reviewed"),
        isActive: activeFilter === "reviewed",
      },
    ],
    [activeFilter, setActiveFilter, worksheetCounts]
  );

  const quickActions = (
    <div className="space-y-3">
      {onCreateNew && (
        <Button
          onClick={onCreateNew}
          className="w-full justify-start"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Worksheet
        </Button>
      )}
      <div className="space-y-2">
        <label
          htmlFor="therapistFilter"
          className="block text-xs font-semibold text-gray-700 mb-1"
        >
          Search Therapist
        </label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            id="therapistFilter"
            value={therapistFilter}
            onChange={(e) => setTherapistFilter(e.target.value)}
            placeholder="Search..."
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>
    </div>
  );

  return (
    <ContextualSidebar
      title="Worksheets"
      description="Filter your assignments"
      items={sidebarItems}
      quickActions={quickActions}
    />
  );
}
