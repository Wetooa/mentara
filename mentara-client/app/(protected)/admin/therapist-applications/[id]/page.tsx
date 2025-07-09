"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TherapistApplicationDetails } from "@/components/admin/TherapistApplicationDetails";
import { useTherapistApplication } from "@/hooks/useTherapistApplications";

export default function TherapistApplicationPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = use(props.params);
  const router = useRouter();
  
  // Use React Query hook for data fetching
  const { 
    data: application, 
    isLoading, 
    error,
    refetch 
  } = useTherapistApplication(params.id);


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/admin/therapist-applications")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          Therapist Application
        </h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500">Loading application details...</p>
          </div>
        </div>
      ) : error ? (
        <div className="py-8 text-center">
          <p className="text-red-500">
            {error instanceof Error ? error.message : 'Failed to load application. Please try again.'}
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <Button
              onClick={() => refetch()}
              variant="outline"
            >
              Try Again
            </Button>
            <Button
              onClick={() => router.push("/admin/therapist-applications")}
              variant="outline"
            >
              Return to Applications
            </Button>
          </div>
        </div>
      ) : application ? (
        <TherapistApplicationDetails
          application={application}
          onStatusChange={() => {}}
        />
      ) : (
        <div className="py-8 text-center text-gray-500">
          Application not found.
        </div>
      )}
    </div>
  );
}
