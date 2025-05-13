import { useState, useEffect } from "react";
import { mockTherapistData } from "@/data/mockTherapistData";

export function useTherapistData() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState(mockTherapistData);

  useEffect(() => {
    // Simulate API fetch delay
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // In a real app, this would be a fetch call
        // const response = await fetch('/api/therapist/dashboard');
        // const data = await response.json();

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        setData(mockTherapistData);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Unknown error occurred")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    isLoading,
    error,
    therapist: data.therapist,
    stats: data.stats,
    upcomingAppointments: data.upcomingAppointments,
  };
}
