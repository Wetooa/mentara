import { useState, useEffect } from "react";
import { mockPatientsData } from "@/data/mockPatientsData";

export function usePatientData(patientId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [patient, setPatient] = useState<any>(null);

  useEffect(() => {
    // Simulate API fetch delay
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // In a real app, this would be a fetch call
        // const response = await fetch(`/api/patients/${patientId}`);
        // const data = await response.json();

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const foundPatient = mockPatientsData.find((p) => p.id === patientId);

        if (!foundPatient) {
          throw new Error("Patient not found");
        }

        setPatient(foundPatient);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Unknown error occurred")
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (patientId) {
      fetchData();
    }
  }, [patientId]);

  return { isLoading, error, patient };
}
