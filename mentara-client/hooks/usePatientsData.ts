import { useState, useEffect, useCallback } from "react";
import { patientsApi } from "@/lib/api/patients";
import { Patient, PatientFilters } from "@/types/patient";
import { mockPatientsData } from "@/data/mockPatientsData";

export function usePatientsData() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<PatientFilters>({
    status: 'all',
  });

  // Fetch all patients
  const fetchPatients = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to fetch from real API first
      const patientsData = await patientsApi.getAllPatients();
      setPatients(patientsData);
      console.log("Successfully loaded patients from API:", patientsData.length);
    } catch (err) {
      console.error("Error fetching patients from API:", err);
      setError(err instanceof Error ? err : new Error("Failed to load patients"));

      // Fallback to mock data
      console.log("Using mock data as fallback");
      setPatients(mockPatientsData as Patient[]);
      setError(new Error("Using mock data - API unavailable"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Apply search and filters to patients
  const applyFilters = useCallback(() => {
    let filtered = [...patients];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (patient) =>
          patient.name.toLowerCase().includes(query) ||
          patient.fullName.toLowerCase().includes(query) ||
          patient.diagnosis.toLowerCase().includes(query) ||
          patient.treatmentPlan.toLowerCase().includes(query) ||
          patient.email.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(patient => patient.status === filters.status);
    }

    // Apply diagnosis filter
    if (filters.diagnosis) {
      filtered = filtered.filter(patient => 
        patient.diagnosis.toLowerCase().includes(filters.diagnosis!.toLowerCase())
      );
    }

    // Apply treatment plan filter
    if (filters.treatmentPlan) {
      filtered = filtered.filter(patient => 
        patient.treatmentPlan.toLowerCase().includes(filters.treatmentPlan!.toLowerCase())
      );
    }

    // Apply progress range filter
    if (filters.progressRange) {
      filtered = filtered.filter(patient => 
        patient.progress >= filters.progressRange!.min && 
        patient.progress <= filters.progressRange!.max
      );
    }

    // Apply session range filter
    if (filters.sessionRange) {
      filtered = filtered.filter(patient => 
        patient.currentSession >= filters.sessionRange!.min && 
        patient.currentSession <= filters.sessionRange!.max
      );
    }

    // Apply date range filter
    if (filters.assignedDateRange) {
      const startDate = new Date(filters.assignedDateRange.start);
      const endDate = new Date(filters.assignedDateRange.end);
      filtered = filtered.filter(patient => {
        if (!patient.assignedAt) return false;
        const assignedDate = new Date(patient.assignedAt);
        return assignedDate >= startDate && assignedDate <= endDate;
      });
    }

    // Apply overdue worksheets filter
    if (filters.hasOverdueWorksheets) {
      filtered = filtered.filter(patient => 
        patient.worksheets.some(worksheet => worksheet.status === 'overdue')
      );
    }

    // Apply upcoming sessions filter
    if (filters.hasUpcomingSessions) {
      const now = new Date();
      filtered = filtered.filter(patient => 
        patient.sessions.some(session => 
          session.status === 'scheduled' && new Date(session.date) > now
        )
      );
    }

    setFilteredPatients(filtered);
  }, [patients, searchQuery, filters]);

  // Search patients
  const searchPatients = async (query: string) => {
    setSearchQuery(query);
    
    // If using API and search query, use server-side search
    if (query.trim() && !error?.message.includes("mock data")) {
      try {
        const searchResults = await patientsApi.searchPatients(query);
        setFilteredPatients(searchResults);
        return;
      } catch (err) {
        console.error("Server-side search failed, using client-side:", err);
      }
    }
    
    // Client-side filtering will happen in useEffect
  };

  // Update filters
  const updateFilters = (newFilters: Partial<PatientFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ status: 'all' });
    setSearchQuery("");
  };

  // Add a new patient (optimistic update)
  const addPatient = (newPatient: Patient) => {
    setPatients(prev => [newPatient, ...prev]);
  };

  // Update a patient (optimistic update)
  const updatePatient = (patientId: string, updates: Partial<Patient>) => {
    setPatients(prev => 
      prev.map(patient => 
        patient.id === patientId ? { ...patient, ...updates } : patient
      )
    );
  };

  // Remove a patient
  const removePatient = (patientId: string) => {
    setPatients(prev => prev.filter(patient => patient.id !== patientId));
  };

  // Refresh patients list
  const refreshPatients = () => {
    fetchPatients();
  };

  // Get patient statistics
  const getStatistics = () => {
    const totalPatients = patients.length;
    const activePatients = patients.filter(p => p.status === 'active').length;
    const completedTreatments = patients.filter(p => p.status === 'completed').length;
    const averageProgress = patients.length > 0 
      ? patients.reduce((sum, p) => sum + p.progress, 0) / patients.length 
      : 0;
    
    const now = new Date();
    const upcomingSessions = patients.reduce((total, patient) => 
      total + patient.sessions.filter(session => 
        session.status === 'scheduled' && new Date(session.date) > now
      ).length, 0
    );
    
    const overdueWorksheets = patients.reduce((total, patient) => 
      total + patient.worksheets.filter(worksheet => 
        worksheet.status === 'overdue'
      ).length, 0
    );

    const recentAssignments = patients.filter(patient => {
      if (!patient.assignedAt) return false;
      const assignedDate = new Date(patient.assignedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return assignedDate > weekAgo;
    }).length;

    return {
      totalPatients,
      activePatients,
      completedTreatments,
      averageProgress: Math.round(averageProgress),
      upcomingSessions,
      overdueWorksheets,
      recentAssignments,
    };
  };

  // Load patients on mount
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return {
    isLoading,
    error,
    patients,
    filteredPatients,
    searchQuery,
    filters,
    searchPatients,
    updateFilters,
    clearFilters,
    addPatient,
    updatePatient,
    removePatient,
    refreshPatients,
    getStatistics,
  };
}