import { useState, useEffect } from "react";
import { patientsApi } from "@/lib/api/patients";
import { Patient } from "@/types/patient";
import { mockPatientsData } from "@/data/mockPatientsData";

export function usePatientData(patientId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to fetch from real API first
        const patientData = await patientsApi.getPatientById(patientId);
        setPatient(patientData);
      } catch (err) {
        console.error("Error fetching patient from API:", err);
        setError(err instanceof Error ? err : new Error("Failed to load patient data"));

        // Fallback to mock data
        const foundPatient = mockPatientsData.find((p) => p.id === patientId);
        if (foundPatient) {
          console.log("Using mock data as fallback for patient:", patientId);
          setPatient(foundPatient as Patient);
          setError(new Error("Using mock data - API unavailable"));
        } else {
          setError(new Error("Patient not found"));
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (patientId) {
      fetchData();
    }
  }, [patientId]);

  // Function to refresh patient data
  const refreshPatient = async () => {
    if (patientId) {
      setIsLoading(true);
      try {
        const patientData = await patientsApi.getPatientById(patientId);
        setPatient(patientData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to refresh patient data"));
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Function to update patient data optimistically
  const updatePatient = (updates: Partial<Patient>) => {
    if (patient) {
      setPatient({ ...patient, ...updates });
    }
  };

  return { 
    isLoading, 
    error, 
    patient, 
    refreshPatient, 
    updatePatient 
  };
}
