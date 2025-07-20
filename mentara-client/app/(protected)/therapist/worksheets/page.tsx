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
        let statusFilter: "assigned" | "in_progress" | "completed" | "overdue" | undefined;
        if (activeFilter !== "everything") {
          statusFilter = activeFilter as "assigned" | "in_progress" | "completed" | "overdue";
        }

        // Call the API to get worksheet assignments (enhanced endpoint)
        const assignmentsResponse = await api.therapists.worksheets.getAssignments({
          status: statusFilter,
          limit: 100,
          page: 1,
        });

        // Transform assignment data to match Task interface
        const transformedTasks: Task[] = assignmentsResponse.assignments.map((assignment) => ({
          id: assignment.worksheetId,
          title: assignment.worksheetTitle,
          patientName: assignment.clientName || "Unknown Patient",
          date: assignment.assignedAt,
          status: assignment.status,
          isCompleted: assignment.status === "completed",
          instructions: `Assigned to ${assignment.clientName}`,
          materials: [],
          myWork: [],
          submittedAt: assignment.completedAt,
          feedback: "",
        }));

        setTasks(transformedTasks);
      } catch (err) {
        console.error("Error fetching therapist worksheets:", err);
        
        // Fallback to basic worksheets endpoint if assignments endpoint fails
        try {
          const worksheetsResponse = await api.therapists.worksheets.getAll({
            limit: 100,
            offset: 0,
          });

          const fallbackTasks: Task[] = Array.isArray(worksheetsResponse) 
            ? worksheetsResponse.map((worksheet) => ({
                id: worksheet.id,
                title: worksheet.title,
                patientName: "Unassigned",
                date: worksheet.createdAt,
                status: "assigned" as const,
                isCompleted: false,
                instructions: worksheet.description || "",
                materials: [],
                myWork: [],
                submittedAt: undefined,
                feedback: "",
              }))
            : [];

          setTasks(fallbackTasks);
        } catch (fallbackErr) {
          console.error("Error with fallback worksheets fetch:", fallbackErr);
          setError("Failed to load worksheets. Please try again.");
        }
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
