"use client";

import React, { useState } from "react";
import WorksheetsSidebar from "@/components/worksheets/WorksheetsSidebar";
import WorksheetsList from "@/components/worksheets/WorksheetsList";
import { Task } from "@/components/worksheets/types";

// Mock data for worksheets tasks with more detailed information
const mockTasks: Task[] = [
  {
    id: "task-2",
    title: "Exercise 5",
    therapistName: "Therapist Jackson",
    date: "2025-03-22",
    status: "upcoming",
    isCompleted: true,
    instructions: "None",
    points: 30,
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
    points: 20,
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
    points: 15,
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
    points: 10,
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

  // Filter tasks based on selected filters
  const getFilteredTasks = () => {
    let filtered = [...mockTasks];

    // Apply therapist filter if selected
    if (therapistFilter) {
      filtered = filtered.filter((task) =>
        task.therapistName.toLowerCase().includes(therapistFilter.toLowerCase())
      );
    }

    // Apply status filter
    switch (activeFilter) {
      case "upcoming":
        filtered = filtered.filter((task) => task.status === "upcoming");
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
        therapistFilter={therapistFilter}
        setTherapistFilter={setTherapistFilter}
      />
      <WorksheetsList tasks={getFilteredTasks()} />
    </div>
  );
}
