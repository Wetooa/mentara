import { TherapistApplication } from "@/data/mockTherapistApplicationData";
import { createApiClient } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";

// Create a function to get the API client with authentication
const getApiClient = () => {
  if (typeof window !== "undefined") {
    // Client-side: use the hook
    const { getToken } = useAuth();
    return createApiClient(() => getToken());
  } else {
    // Server-side: no auth token available
    return createApiClient(() => Promise.resolve(null));
  }
};

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

    // Use the centralized API client with JWT authentication
    const api = getApiClient();
    const data = await api.therapist.submitApplication(applicationData);

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
    const api = getApiClient();
    const data = await api.therapist.getApplicationById(id);
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
    const api = getApiClient();
    const data = await api.therapist.getApplications({ status });
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
  status: "approved" | "rejected"
): Promise<{
  application: TherapistApplication;
  therapistAccount?: any;
  generatedPassword?: string;
}> {
  try {
    const api = getApiClient();
    const data = await api.therapist.updateApplication(id, { status });
    
    return {
      application: data.application || data,
      therapistAccount: data.therapistAccount || null,
      generatedPassword: data.generatedPassword || null,
    };
  } catch (error) {
    console.error("Error updating therapist application status:", error);
    throw error;
  }
}
