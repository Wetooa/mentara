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

        // Convert activeFilter to status filter for API
        let isCompleted: boolean | undefined;
        if (activeFilter === "completed") {
          isCompleted = true;
        } else if (activeFilter === "pending") {
          isCompleted = false;
        }

        // Call the API to get worksheets
        const worksheetsResponse = await api.worksheets.getAll({
          userId,
          isCompleted,
          limit: 100
        });
        
        // Transform worksheets to match Task interface
        const transformedTasks: Task[] = Array.isArray(worksheetsResponse.worksheets) 
          ? worksheetsResponse.worksheets.map(worksheet => ({
              ...worksheet,
              date: worksheet.createdAt,
              status: 'assigned' as const,
              isCompleted: false,
              therapistName: undefined,
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
