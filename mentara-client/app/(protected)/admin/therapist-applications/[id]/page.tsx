"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TherapistApplicationDetails } from "@/components/admin/TherapistApplicationDetails";
import { toast } from "sonner";
import { useApi } from "@/lib/api";

interface TherapistApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  province: string;
  providerType: string;
  professionalLicenseType: string;
  status: string;
  submissionDate: string;
  [key: string]: any; // For other properties
}

export default function TherapistApplicationPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = use(props.params);
  const router = useRouter();
  const api = useApi();
  const [application, setApplication] = useState<TherapistApplication | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplication = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use the API client instead of direct fetch
        const application = await api.therapists.application.getById(params.id);
        setApplication(application);
      } catch (err) {
        console.error("Error fetching therapist application:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        toast.error("Error loading application details");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchApplication();
    }
  }, [params.id]);

  // Handle status change
  const handleStatusChange = async (
    id: string,
    status: "approved" | "rejected" | "pending"
  ) => {
    setApplication((prev) => (prev ? { ...prev, status } : null));
  };

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
          <p className="text-red-500">{error}</p>
          <Button
            onClick={() => router.push("/admin/therapist-applications")}
            variant="outline"
            className="mt-4"
          >
            Return to Applications
          </Button>
        </div>
      ) : application ? (
        <TherapistApplicationDetails
          application={application}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <div className="py-8 text-center text-gray-500">
          Application not found.
        </div>
      )}
    </div>
  );
}
