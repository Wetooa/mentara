"use client";

import React, { useState, useEffect } from "react";
import WorksheetsSidebar from "@/components/worksheets/WorksheetsSidebar";
import WorksheetsList from "@/components/worksheets/WorksheetsList";
import { Task } from "@/components/worksheets/types";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/lib/api";

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
            status = "REVIEWED"; // Completed worksheets are marked as REVIEWED
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
              date: worksheet.createdAt,
              status: mapWorksheetStatus(worksheet.status, worksheet.dueDate),
              isCompleted: worksheet.status === "REVIEWED",
              therapistName: worksheet.therapist?.user
                ? `${worksheet.therapist.user.firstName} ${worksheet.therapist.user.lastName}`
                : undefined,
            }))
          : [];

        setTasks(transformedTasks);
      } catch (err) {
        console.error("Error fetching worksheets:", err);
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
  ): "assigned" | "submitted" | "completed" | "overdue" => {
    if (backendStatus === "REVIEWED") return "completed";
    if (backendStatus === "SUBMITTED") return "submitted";
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

  return (
    <div className="flex h-full min-h-screen overflow-hidden">
      <WorksheetsSidebar
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        therapistFilter={therapistFilter}
        setTherapistFilter={setTherapistFilter}
      />

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-red-500">
          <p>{error}</p>
        </div>
      ) : (
        <WorksheetsList tasks={getFilteredTasks()} />
      )}
    </div>
  );
}
