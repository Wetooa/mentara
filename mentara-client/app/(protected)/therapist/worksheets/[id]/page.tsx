"use client";

import React from "react";
import { useRouter } from "next/navigation";
import TherapistTaskDetailPage from "@/components/worksheets/TherapistTaskDetailPage";
import { Task } from "@/components/worksheets/types";

// Mock data for worksheets tasks with more detailed information
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
    feedback:
      "Great job identifying triggers and responses. Keep practicing the techniques we discussed.",
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
    feedback:
      "I'm glad you found the exercise helpful. Your observations about being more present are insightful.",
  },
];

interface WorksheetDetailPageProps {
  params: {
    id: string;
  };
}

export default function WorksheetDetailPage({
  params,
}: WorksheetDetailPageProps) {
  const router = useRouter();

  // Find the task that matches the ID from the URL
  const task = mockTasks.find((task) => task.id === params.id);

  const handleBack = () => {
    router.push("/therapist/worksheets");
  };

  return <TherapistTaskDetailPage task={task} onBack={handleBack} />;
}
