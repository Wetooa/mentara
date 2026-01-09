"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import WorksheetsSidebar from "@/components/worksheets/WorksheetsSidebar";
import WorksheetsList from "@/components/worksheets/WorksheetsList";
import { Task } from "@/components/worksheets/types";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/lib/api";
import { logger } from "@/lib/logger";

// Helper function to map backend status to frontend status display
const mapWorksheetStatus = (
  backendStatus: string,
  dueDate: string | null | undefined
): "upcoming" | "past_due" | "completed" | "reviewed" => {
  if (backendStatus === "REVIEWED") {
    return "reviewed";
  }
  if (backendStatus === "SUBMITTED") {
    return "completed";
  }
  if (backendStatus === "ASSIGNED") {
    if (!dueDate) {
      return "upcoming";
    }
    const due = new Date(dueDate);
    const now = new Date();
    const dueDateOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return dueDateOnly < nowDateOnly ? "past_due" : "upcoming";
  }
  return "upcoming";
};

export default function WorksheetsPage() {
  // Filter state - only changes when user clicks buttons
  const [activeFilter, setActiveFilter] = useState<string>("everything");
  const [therapistFilter, setTherapistFilter] = useState<string>("");
  
  // Data state - fetched once, never reset
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const api = useApi();
  const userId = user?.id;
  const hasFetchedRef = useRef<string | null>(null);

  // Fetch worksheets ONCE per userId - never refetch
  useEffect(() => {
    console.log("[WorksheetsPage] useEffect triggered", { userId, hasFetched: hasFetchedRef.current, allTasksCount: allTasks.length });
    
    if (!userId) {
      console.log("[WorksheetsPage] No userId, setting loading to false");
      setIsLoading(false);
      return;
    }

    if (hasFetchedRef.current === userId) {
      console.log("[WorksheetsPage] Already fetched for this userId, skipping");
      setIsLoading(false);
      return;
    }

    hasFetchedRef.current = userId;
    console.log("[WorksheetsPage] Starting fetch for userId:", userId);

    async function fetchAllWorksheets() {
      try {
        setError(null);
        setIsLoading(true);
        console.log("[WorksheetsPage] Fetching worksheets...");

        const worksheetsResponse = await api.worksheets.getAll({
          userId,
          status: undefined,
          limit: 100,
        });

        console.log("[WorksheetsPage] API response:", {
          count: worksheetsResponse.worksheets?.length,
          statuses: worksheetsResponse.worksheets?.map((w: any) => w.status),
        });

        const transformedTasks: Task[] = Array.isArray(worksheetsResponse.worksheets)
          ? worksheetsResponse.worksheets.map((worksheet) => {
              const mappedStatus = mapWorksheetStatus(worksheet.status, worksheet.dueDate);
              return {
                ...worksheet,
                date: worksheet.dueDate,
                status: mappedStatus,
                isCompleted:
                  worksheet.status === "REVIEWED" || worksheet.status === "SUBMITTED",
                therapistName: worksheet.therapist?.user
                  ? `${worksheet.therapist.user.firstName} ${worksheet.therapist.user.lastName}`
                  : undefined,
              };
            })
          : [];

        console.log("[WorksheetsPage] Transformed tasks:", {
          count: transformedTasks.length,
          statusCounts: transformedTasks.reduce((acc: any, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
          }, {}),
          taskIds: transformedTasks.map((t) => t.id),
        });

        setAllTasks(transformedTasks);
        console.log("[WorksheetsPage] allTasks state updated, count:", transformedTasks.length);
      } catch (err) {
        console.error("[WorksheetsPage] Error fetching worksheets:", err);
        logger.error("Error fetching worksheets:", err);
        setError("Failed to load worksheets. Please try again.");
      } finally {
        setIsLoading(false);
        console.log("[WorksheetsPage] Loading complete, isLoading set to false");
      }
    }

    fetchAllWorksheets();
  }, [userId, api]);

  // Filter tasks - memoized to prevent unnecessary recalculations
  const filteredTasks = useMemo(() => {
    console.log("[WorksheetsPage] getFilteredTasks called", {
      activeFilter,
      allTasksCount: allTasks.length,
      isLoading,
      therapistFilter,
    });

    // If loading and no data, return empty
    if (isLoading && allTasks.length === 0) {
      console.log("[WorksheetsPage] Still loading, returning empty array");
      return [];
    }

    // If no tasks, return empty
    if (!Array.isArray(allTasks) || allTasks.length === 0) {
      console.log("[WorksheetsPage] No tasks available, returning empty array");
      return [];
    }

    // Start with all tasks
    let filtered = [...allTasks];
    console.log("[WorksheetsPage] Starting filter with", filtered.length, "tasks");

    // Apply status filter
    if (activeFilter !== "everything") {
      const beforeCount = filtered.length;
      filtered = filtered.filter((task) => {
        if (!task.status) {
          return false;
        }

        switch (activeFilter) {
          case "upcoming":
            return task.status === "upcoming";
          case "past_due":
            return task.status === "past_due";
          case "completed":
            return task.status === "completed";
          case "reviewed":
            return task.status === "reviewed";
          default:
            return true;
        }
      });
      console.log("[WorksheetsPage] After status filter:", {
        activeFilter,
        before: beforeCount,
        after: filtered.length,
      });
    }

    // Apply therapist filter
    if (therapistFilter) {
      const beforeCount = filtered.length;
      filtered = filtered.filter((task) =>
        task.therapistName?.toLowerCase().includes(therapistFilter.toLowerCase())
      );
      console.log("[WorksheetsPage] After therapist filter:", {
        therapistFilter,
        before: beforeCount,
        after: filtered.length,
      });
    }

    console.log("[WorksheetsPage] Final filtered result:", {
      activeFilter,
      count: filtered.length,
      taskIds: filtered.map((t) => t.id),
      taskStatuses: filtered.map((t) => t.status),
      taskDates: filtered.map((t) => t.date),
    });

    return filtered;
  }, [allTasks, activeFilter, therapistFilter, isLoading]);

  // Calculate counts for badges
  const worksheetCounts = {
    everything: allTasks.length,
    upcoming: allTasks.filter((t) => t.status === "upcoming").length,
    pastDue: allTasks.filter((t) => t.status === "past_due").length,
    completed: allTasks.filter((t) => t.status === "completed").length,
    reviewed: allTasks.filter((t) => t.status === "reviewed").length,
  };

  // Log when filter changes
  const handleFilterChange = (filter: string) => {
    console.log("[WorksheetsPage] Filter button clicked:", {
      oldFilter: activeFilter,
      newFilter: filter,
      allTasksCount: allTasks.length,
      isLoading,
    });
    setActiveFilter(filter);
  };

  return (
    <main className="flex h-screen overflow-hidden bg-gray-50" aria-label="Worksheets">
      <nav aria-label="Worksheet filters">
        <WorksheetsSidebar
          activeFilter={activeFilter}
          setActiveFilter={handleFilterChange}
          therapistFilter={therapistFilter}
          setTherapistFilter={setTherapistFilter}
          worksheetCounts={worksheetCounts}
        />
      </nav>

      <div className="flex-1 overflow-y-auto min-w-0">
        {isLoading && allTasks.length === 0 ? (
          <div className="flex items-center justify-center h-full" aria-live="polite" aria-busy="true">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" aria-label="Loading worksheets"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-500" role="alert" aria-live="assertive">
            <p>{error}</p>
          </div>
        ) : (
          <WorksheetsList tasks={filteredTasks} filterKey={activeFilter} />
        )}
      </div>
    </main>
  );
}
