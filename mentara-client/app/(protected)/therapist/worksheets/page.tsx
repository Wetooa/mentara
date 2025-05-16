"use client";

import React, { useState } from "react";
import WorksheetsSidebar from "@/components/worksheets/TherapistWorksheetsSidebar";
import TherapistWorksheetsList from "@/components/worksheets/TherapistWorksheetsList";
import { Task } from "@/components/worksheets/types";

// Mock data for therapist worksheets
const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Task 1",
    patientName: "John Doe",
    date: "2025-04-22",
    status: "assigned",
    isCompleted: false,
    instructions: "Complete the worksheet on cognitive restructuring",
  },
  {
    id: "task-2",
    title: "Exercise 5",
    patientName: "Sarah Williams",
    date: "2025-03-22",
    status: "completed",
    isCompleted: true,
    instructions: "Complete the graded exposure exercise",
    materials: [
      {
        id: "mat-1",
        filename: "ExposureWorksheet.pdf",
        url: "/files/ExposureWorksheet.pdf",
      },
    ],
    myWork: [
      {
        id: "work-1",
        filename: "SarahWilliamsExposureWorksheet.pdf",
        url: "/files/SarahWilliamsExposureWorksheet.pdf",
      },
    ],
    submittedAt: "2025-03-22T20:53:00",
  },
  {
    id: "task-3",
    title: "Weekly reflection",
    patientName: "Mike Chen",
    date: "2025-04-18",
    status: "past_due",
    isCompleted: false,
    instructions:
      "Reflect on your week and identify three challenging situations and how you responded to them.",
  },
  {
    id: "task-4",
    title: "Mindfulness exercise",
    patientName: "Emma Johnson",
    date: "2025-04-15",
    status: "completed",
    isCompleted: true,
    instructions:
      "Complete the 15-minute mindfulness exercise and write about your experience.",
    myWork: [
      {
        id: "work-2",
        filename: "EmmaJohnsonMindfulnessReflection.pdf",
        url: "/files/EmmaJohnsonMindfulnessReflection.pdf",
      },
    ],
    submittedAt: "2025-04-15T15:30:00",
  },
];

export default function TherapistWorksheetsPage() {
  const [activeFilter, setActiveFilter] = useState<string>("everything");
  const [patientFilter, setPatientFilter] = useState<string>("");

  // Filter tasks based on selected filters
  const getFilteredTasks = () => {
    let filtered = [...mockTasks];

    // Apply patient filter if selected
    if (patientFilter) {
      filtered = filtered.filter((task) =>
        task.patientName?.toLowerCase().includes(patientFilter.toLowerCase())
      );
    }

    // Apply status filter
    switch (activeFilter) {
      case "assigned":
        filtered = filtered.filter((task) => task.status === "assigned");
        break;
      case "past_due":
        filtered = filtered.filter((task) => task.status === "past_due");
        break;
      case "completed":
        filtered = filtered.filter((task) => task.status === "completed");
        break;
      // "everything" returns all tasks
    }

    return filtered;
  };

  return (
    <div className="flex h-full">
      <WorksheetsSidebar
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        patientFilter={patientFilter}
        setPatientFilter={setPatientFilter}
      />
      <TherapistWorksheetsList tasks={getFilteredTasks()} />
    </div>
  );
}
