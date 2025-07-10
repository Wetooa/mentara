"use client";

import React, { useState, useEffect } from "react";
import WorksheetsSidebar from "@/components/worksheets/TherapistWorksheetsSidebar";
import TherapistWorksheetsList from "@/components/worksheets/TherapistWorksheetsList";
import { Task } from "@/components/worksheets/types";
import { useApi } from "@/lib/api";

export default function TherapistWorksheetsPage() {
  const [activeFilter, setActiveFilter] = useState<string>("everything");
  const [patientFilter, setPatientFilter] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const api = useApi();

  // Fetch worksheets from API
  useEffect(() => {
    async function fetchTherapistWorksheets() {
      try {
        setIsLoading(true);
        setError(null);

        // Convert activeFilter to status filter for API
        let statusFilter: string | undefined;
        if (activeFilter !== "everything") {
          statusFilter = activeFilter;
        }

        // Call the API to get therapist worksheets
        const worksheets = await api.therapists.worksheets.getAll({
          status: statusFilter,
        });

        // Transform API data to match Task interface
        const transformedTasks: Task[] = worksheets.map((worksheet: any) => ({
          id: worksheet.id,
          title: worksheet.title,
          patientName: worksheet.client?.user?.firstName && worksheet.client?.user?.lastName 
            ? `${worksheet.client.user.firstName} ${worksheet.client.user.lastName}`
            : "Unknown Patient",
          date: worksheet.createdAt,
          status: worksheet.status || "assigned",
          isCompleted: worksheet.status === "completed",
          instructions: worksheet.instructions || "",
          materials: worksheet.materials || [],
          myWork: worksheet.submissions || [],
          submittedAt: worksheet.submittedAt,
        }));

        setTasks(transformedTasks);
      } catch (err) {
        console.error("Error fetching therapist worksheets:", err);
        setError("Failed to load worksheets. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTherapistWorksheets();
  }, [activeFilter, api.therapists.worksheets]);

  // Filter tasks based on selected filters
  const getFilteredTasks = () => {
    // If still loading, return empty array
    if (isLoading) return [];

    let filtered = [...tasks];

    // Apply patient filter if selected
    if (patientFilter) {
      filtered = filtered.filter((task) =>
        task.patientName?.toLowerCase().includes(patientFilter.toLowerCase())
      );
    }

    return filtered;
  };

  return (
    <div className="flex h-full min-h-screen overflow-hidden">
      <WorksheetsSidebar
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        patientFilter={patientFilter}
        setPatientFilter={setPatientFilter}
      />

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-red-500">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      ) : (
        <TherapistWorksheetsList tasks={getFilteredTasks()} />
      )}
    </div>
  );
}
