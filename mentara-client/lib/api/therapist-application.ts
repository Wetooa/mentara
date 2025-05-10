import { TherapistApplication } from "@/data/mockTherapistApplicationData";

/**
 * Submit a therapist application to the API
 * @param applicationData Complete therapist application data
 * @returns The created application object with ID
 */
export async function submitTherapistApplication(
  applicationData: any
): Promise<{ id: string }> {
  try {
    console.log("Submitting application data:", applicationData);

    // Ensure applicationData is properly sanitized for JSON
    const sanitizedData = JSON.parse(JSON.stringify(applicationData));

    const response = await fetch("/api/therapist/application", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sanitizedData),
      cache: "no-store",
    });

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Received non-JSON response:", text);
      throw new Error(
        "Server returned non-JSON response. Please try again later."
      );
    }

    // Process the JSON response normally
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to submit application");
    }

    return { id: data.applicationId };
  } catch (error) {
    console.error("Error submitting therapist application:", error);
    throw error;
  }
}

/**
 * Get a single therapist application by ID
 * @param id Application ID
 * @returns The application data
 */
export async function getTherapistApplication(
  id: string
): Promise<TherapistApplication> {
  try {
    const response = await fetch(`/api/therapist/application/${id}`, {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch application");
    }

    const data = await response.json();
    return data.application;
  } catch (error) {
    console.error("Error fetching therapist application:", error);
    throw error;
  }
}

/**
 * Get all therapist applications (admin access only)
 * @param status Optional status filter
 * @returns List of applications
 */
export async function getAllTherapistApplications(
  status?: string
): Promise<TherapistApplication[]> {
  try {
    const params = new URLSearchParams();
    if (status) {
      params.append("status", status);
    }

    const response = await fetch(
      `/api/therapist/application?${params.toString()}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch applications");
    }

    const data = await response.json();
    return data.applications;
  } catch (error) {
    console.error("Error fetching therapist applications:", error);
    throw error;
  }
}

/**
 * Update therapist application status (admin access only)
 * @param id Application ID
 * @param status New status (approved/rejected)
 * @returns Updated application data
 */
export async function updateTherapistApplicationStatus(
  id: string,
  status: "approved" | "rejected"
): Promise<{
  application: TherapistApplication;
  therapistAccount?: any;
  generatedPassword?: string;
}> {
  try {
    const response = await fetch(`/api/therapist/application/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update application status");
    }

    const data = await response.json();
    return {
      application: data.application,
      therapistAccount: data.therapistAccount || null,
      generatedPassword: data.generatedPassword || null,
    };
  } catch (error) {
    console.error("Error updating therapist application status:", error);
    throw error;
  }
}
