"use client";

import React, { useState, useEffect } from "react";
import WorksheetsSidebar from "@/components/worksheets/WorksheetsSidebar";
import WorksheetsList from "@/components/worksheets/WorksheetsList";
import { Task } from "@/components/worksheets/types";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/lib/api";
import { logger } from "@/lib/logger";

export default function WorksheetsPage() {
  const [activeFilter, setActiveFilter] = useState<string>("everything");
  const [therapistFilter, setTherapistFilter] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const api = useApi();
  const userId = user?.id;

  // Fetch worksheets from API
  useEffect(() => {
    async function fetchWorksheets() {
      if (!userId) return;

      try {
        setIsLoading(true);
        setError(null);

        // Map frontend filter to backend status parameter
        let status: string | undefined;
        switch (activeFilter) {
          case "upcoming":
            status = "upcoming"; // Backend handles upcoming = ASSIGNED + dueDate >= now
            break;
          case "past_due":
            status = "OVERDUE"; // Backend handles overdue = ASSIGNED + dueDate < now
            break;
          case "completed":
            status = "SUBMITTED"; // Completed worksheets are marked as SUBMITTED
            break;
          case "reviewed":
            status = "REVIEWED"; // Reviewed worksheets are marked as REVIEWED
            break;
          case "everything":
          default:
            status = undefined; // No status filter = get all worksheets
            break;
        }

        // Call the API to get worksheets with proper status filtering
        const worksheetsResponse = await api.worksheets.getAll({
          userId,
          status,
          limit: 100,
        });

        // Transform worksheets to match Task interface
        const transformedTasks: Task[] = Array.isArray(
          worksheetsResponse.worksheets
        )
          ? worksheetsResponse.worksheets.map((worksheet) => ({
              ...worksheet,
              date: worksheet.dueDate,
              status: mapWorksheetStatus(worksheet.status, worksheet.dueDate),
              isCompleted:
                worksheet.status === "REVIEWED" ||
                worksheet.status === "SUBMITTED",
              therapistName: worksheet.therapist?.user
                ? `${worksheet.therapist.user.firstName} ${worksheet.therapist.user.lastName}`
                : undefined,
            }))
          : [];

        setTasks(transformedTasks);
      } catch (err) {
        logger.error("Error fetching worksheets:", err);
        setError("Failed to load worksheets. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorksheets();
  }, [userId, activeFilter, api.worksheets]);

  // Helper function to map backend status to frontend status display
  const mapWorksheetStatus = (
    backendStatus: string,
    dueDate: string
  ): "assigned" | "completed" | "reviewed" | "overdue" => {
    if (backendStatus === "REVIEWED") return "reviewed";
    if (backendStatus === "SUBMITTED") return "completed";
    if (backendStatus === "ASSIGNED") {
      // Check if it's overdue
      const due = new Date(dueDate);
      const now = new Date();
      return due < now ? "overdue" : "assigned";
    }
    return "assigned"; // Default fallback
  };

  // Filter tasks based on selected filters
  const getFilteredTasks = () => {
    // If still loading, return empty array
    if (isLoading) return [];

    // Ensure tasks is always an array
    if (!Array.isArray(tasks)) return [];

    let filtered = [...tasks];

    // Apply status filter based on activeFilter
    if (activeFilter !== "everything") {
      filtered = filtered.filter((task) => {
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
    }

    // Apply therapist filter if selected
    if (therapistFilter) {
      filtered = filtered.filter((task) =>
        task.therapistName
          ?.toLowerCase()
          .includes(therapistFilter.toLowerCase())
      );
    }

    return filtered;
  };

  // Calculate counts for badges
  const worksheetCounts = {
    everything: tasks.length,
    upcoming: tasks.filter((t) => t.status === "upcoming").length,
    pastDue: tasks.filter((t) => t.status === "past_due").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    reviewed: tasks.filter((t) => t.status === "reviewed").length,
  };

  return (
    <main className="flex h-screen overflow-hidden bg-gray-50" aria-label="Worksheets">
      <nav aria-label="Worksheet filters">
        <WorksheetsSidebar
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          therapistFilter={therapistFilter}
          setTherapistFilter={setTherapistFilter}
          worksheetCounts={worksheetCounts}
        />
      </nav>

      <div className="flex-1 overflow-y-auto min-w-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full" aria-live="polite" aria-busy="true">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" aria-label="Loading worksheets"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-500" role="alert" aria-live="assertive">
            <p>{error}</p>
          </div>
        ) : (
          <WorksheetsList tasks={getFilteredTasks()} />
        )}
      </div>
    </main>
  );
}
