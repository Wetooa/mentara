"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TherapistTaskDetailPage from "@/components/worksheets/TherapistTaskDetailPage";
import { Task } from "@/components/worksheets/types";
import { useApi } from "@/lib/api";
import { use } from "react";

// Helper function to map worksheet status to task status
function mapWorksheetStatusToTaskStatus(
  worksheetStatus: string
): Task["status"] {
  switch (worksheetStatus) {
    case "ASSIGNED":
      return "assigned";
    case "SUBMITTED":
      return "completed"; // This maps to showing "Mark as Reviewed" button
    case "REVIEWED":
      return "reviewed";
    case "OVERDUE":
      return "past_due";
    default:
      return "assigned";
  }
}

interface WorksheetDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function WorksheetDetailPage({
  params,
}: WorksheetDetailPageProps) {
  const { id } = use(params);

  return <WorksheetDetailClient worksheetId={id} />;
}

function WorksheetDetailClient({ worksheetId }: { worksheetId: string }) {
  const router = useRouter();
  const api = useApi();

  const [task, setTask] = useState<Task | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch worksheet details from API
  useEffect(() => {
    async function fetchWorksheetDetails() {
      try {
        setIsLoading(true);
        setError(null);

        // Call the API to get worksheet details with assignment and submission data
        const data = await api.therapists.worksheets.getById(worksheetId);

        console.log("Fetched worksheet data:", data);

        // Transform API data to match Task interface
        const transformedTask: Task = {
          id: data.id,
          title: data.title,
          patientName:
            `${data.client.user.firstName} ${data.client.user.lastName}` ||
            "Unassigned",
          date: data.dueDate,
          status: mapWorksheetStatusToTaskStatus(data.status),
          isCompleted:
            data.status === "REVIEWED" || data.status === "SUBMITTED",
          instructions: data.instructions || "",
          materials: data.materials.map((material) => ({
            id: material.id,
            type: "material",
            title: material.filename,
            filename: material.filename,
            url: material.url,
          })),
          myWork: data.submission
            ? [
                {
                  id: data.submission.id,
                  type: "submission",
                  title: "Client Submission",
                  filename: data.submission.fileNames?.[0] || "Submission",
                  url: data.submission.fileUrls?.[0] || "",
                  submittedAt: data.submission.submittedAt,
                  feedback: data.submission.feedback,
                },
              ]
            : [],
          submittedAt: data.submission?.submittedAt,
          feedback: data.submission?.feedback || "",
        };

        setTask(transformedTask);
      } catch (err) {
        console.error("Error fetching worksheet details:", err);
        setError("Failed to load worksheet details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorksheetDetails();
  }, [worksheetId, api.therapists.worksheets]);

  const handleBack = () => {
    router.push("/therapist/worksheets");
  };

  const handleTaskUpdate = () => {
    // Refetch the worksheet data when task is updated
    setTask(undefined); // Clear current task to show loading
    setIsLoading(true);
    setError(null);

    // Refetch worksheet details
    async function refetchWorksheetDetails() {
      try {
        const data = await api.therapists.worksheets.getById(worksheetId);

        // Transform API data to match Task interface (same as before)
        const transformedTask: Task = {
          id: data.worksheet.id,
          title: data.worksheet.title,
          patientName: data.assignment?.clientName || "Unassigned",
          date: data.assignment?.assignedAt || data.worksheet.createdAt,
          status: mapWorksheetStatusToTaskStatus(data.worksheet.status),
          isCompleted:
            data.worksheet.status === "REVIEWED" ||
            data.worksheet.status === "SUBMITTED",
          instructions: data.worksheet.description || "",
          materials: data.worksheet.content
            ? [
                {
                  id: `content_${data.worksheet.id}`,
                  type: "content",
                  title: "Worksheet Content",
                  description: data.worksheet.content,
                  url: "",
                },
              ]
            : [],
          myWork: data.submission
            ? [
                {
                  id: data.submission.id,
                  type: "submission",
                  title: "Client Submission",
                  content: JSON.stringify(data.submission.responses, null, 2),
                  submittedAt: data.submission.submittedAt,
                  feedback: data.submission.feedback,
                  score: data.submission.score,
                  url: "",
                },
              ]
            : [],
          submittedAt: data.submission?.submittedAt,
          feedback: data.submission?.feedback || "",
        };

        setTask(transformedTask);
      } catch (err) {
        console.error("Error refetching worksheet details:", err);
        setError("Failed to load updated worksheet details.");
      } finally {
        setIsLoading(false);
      }
    }

    refetchWorksheetDetails();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Retry
        </button>
        <button
          onClick={handleBack}
          className="mt-2 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <TherapistTaskDetailPage
      task={task}
      onBack={handleBack}
      onTaskUpdate={handleTaskUpdate}
    />
  );
}
