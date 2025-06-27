import { TherapistApplication } from "@/data/mockTherapistApplicationData";

// Client-side therapist application API functions
// These should only be called from React components that have access to useAuth

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

    // Use the Next.js API route which handles authentication
    const response = await fetch("/api/therapist/application", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(applicationData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `Submit failed with status ${response.status}`);
    }

    const data = await response.json();
    return { id: data.applicationId || data.id };
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
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `Fetch failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.application || data;
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
    const queryParams = new URLSearchParams();
    if (status) queryParams.append("status", status);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
    
    const response = await fetch(`/api/therapist/application${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `Fetch failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.applications || data;
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
  status: "approved" | "rejected",
  adminNotes?: string
): Promise<{
  success: boolean;
  message: string;
  credentials?: { email: string; password: string };
}> {
  try {
    const response = await fetch(`/api/therapist/application/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, adminNotes }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `Update failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating therapist application status:", error);
    throw error;
  }
}
