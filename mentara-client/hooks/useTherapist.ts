import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

interface Therapist {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  profileImageUrl?: string;
  hourlyRate?: number;
  patientSatisfaction?: number;
  totalPatients: number;
  province: string;
  providerType: string;
  yearsOfExperience?: number;
  illnessSpecializations: string[];
  therapeuticApproaches: string[];
  languages: string[];
  isActive: boolean;
  isVerified: boolean;
}

interface UseTherapistReturn {
  therapist: Therapist | null;
  loading: boolean;
  error: string | null;
  assignTherapist: (therapistId: string) => Promise<void>;
  removeTherapist: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useTherapist(): UseTherapistReturn {
  const { user } = useAuth();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTherapist = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/users/me/therapist");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch therapist");
      }

      setTherapist(data.therapist);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch therapist"
      );
    } finally {
      setLoading(false);
    }
  };

  const assignTherapist = async (therapistId: string) => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/users/me/therapist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ therapistId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to assign therapist");
      }

      setTherapist(data.therapist);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to assign therapist"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeTherapist = async () => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/users/me/therapist", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove therapist");
      }

      setTherapist(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to remove therapist"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTherapist();
  }, [user?.id]);

  return {
    therapist,
    loading,
    error,
    assignTherapist,
    removeTherapist,
    refetch: fetchTherapist,
  };
}
