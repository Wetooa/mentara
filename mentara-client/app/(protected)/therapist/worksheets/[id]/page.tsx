"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TherapistTaskDetailPage from "@/components/worksheets/TherapistTaskDetailPage";
import { Task } from "@/components/worksheets/types";
import { useApi } from "@/lib/api";

interface WorksheetDetailPageProps {
  params: {
    id: string;
  };
}

export default function WorksheetDetailPage({
  params,
}: WorksheetDetailPageProps) {
  const router = useRouter();
  const api = useApi();
  
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch worksheet details from API
  useEffect(() => {
    async function fetchWorksheetDetails() {
      try {
        setIsLoading(true);
        setError(null);

        // Call the API to get worksheet details
        const worksheet = await api.therapists.worksheets.getById(params.id);

        // Transform API data to match Task interface
        const transformedTask: Task = {
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
          feedback: worksheet.feedback || "",
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
  }, [params.id]);

  const handleBack = () => {
    router.push("/therapist/worksheets");
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

  return <TherapistTaskDetailPage task={task} onBack={handleBack} />;
}
