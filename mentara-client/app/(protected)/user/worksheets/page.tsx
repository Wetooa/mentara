"use client";

import React, { useState, useEffect } from "react";
import WorksheetsSidebar from "@/components/worksheets/WorksheetsSidebar";
import WorksheetsList from "@/components/worksheets/WorksheetsList";
import { Task } from "@/components/worksheets/types";
import { worksheetsApi } from "@/lib/api/worksheets";
import { useAuth } from "@clerk/nextjs";

// Fallback mock data in case API is not available
const mockTasks: Task[] = [
  {
    id: "task-2",
    title: "Exercise 5",
    therapistName: "Therapist Jackson",
    date: "2025-03-22",
    status: "upcoming",
    isCompleted: true,
    instructions: "None",
    materials: [
      {
        id: "mat-1",
        filename: "CSIT337Exercise5.pdf",
        url: "/files/CSIT337Exercise5.pdf",
      },
    ],
    myWork: [
      {
        id: "work-1",
        filename: "TolentinoTristanJamesExercise5.pdf",
        url: "/files/TolentinoTristanJamesExercise5.pdf",
      },
    ],
    submittedAt: "2025-03-22T20:53:00",
  },
  {
    id: "task-1",
    title: "Task 1",
    therapistName: "Therapist Jackson",
    date: "2025-04-22",
    status: "upcoming",
    isCompleted: false,
    instructions: "Complete the worksheet on cognitive restructuring",
  },
  {
    id: "task-3",
    title: "Weekly reflection",
    therapistName: "Therapist Jackson",
    date: "2025-04-18",
    status: "past_due",
    isCompleted: false,
    instructions:
      "Reflect on your week and identify three challenging situations and how you responded to them.",
  },
  {
    id: "task-4",
    title: "Mindfulness exercise",
    therapistName: "Therapist Williams",
    date: "2025-04-15",
    status: "completed",
    isCompleted: true,
    instructions:
      "Complete the 15-minute mindfulness exercise and write about your experience.",
    myWork: [
      {
        id: "work-2",
        filename: "MindfulnessReflection.pdf",
        url: "/files/MindfulnessReflection.pdf",
      },
    ],
    submittedAt: "2025-04-15T15:30:00",
  },
];

export default function WorksheetsPage() {
  const [activeFilter, setActiveFilter] = useState<string>("everything");
  const [therapistFilter, setTherapistFilter] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();

  // Fetch worksheets from API
  useEffect(() => {
    async function fetchWorksheets() {
      if (!userId) return;

      try {
        setIsLoading(true);
        setError(null);

        // Convert activeFilter to status filter for API
        let statusFilter: string | undefined;
        if (activeFilter !== "everything") {
          statusFilter = activeFilter;
        }

        // Call the API to get worksheets
        const worksheets = await worksheetsApi.getAll(
          userId,
          undefined,
          statusFilter
        );
        setTasks(worksheets);
      } catch (err) {
        console.error("Error fetching worksheets:", err);
        setError("Failed to load worksheets. Using mock data instead.");
        setTasks(mockTasks);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorksheets();
  }, [userId, activeFilter]);

  // Filter tasks based on selected filters
  const getFilteredTasks = () => {
    // If still loading, return empty array
    if (isLoading) return [];

    // Use tasks from API or fallback to mock data
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
