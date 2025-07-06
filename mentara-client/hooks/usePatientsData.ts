// This file is deprecated - use usePatientsList instead
// Kept for backward compatibility during migration

import { useState, useEffect, useCallback } from "react";
import { usePatientsList } from "./usePatientsList";
import type { PatientData } from "@/lib/api/services/therapists";

// Legacy types for backward compatibility
interface Patient extends PatientData {
  status?: 'active' | 'completed' | 'inactive';
  progress?: number;
  assignedAt?: string;
}

interface PatientFilters {
  status?: 'all' | 'active' | 'completed' | 'inactive';
  diagnosis?: string;
  treatmentPlan?: string;
  progressRange?: { min: number; max: number };
  sessionRange?: { min: number; max: number };
  assignedDateRange?: { start: string; end: string };
  hasOverdueWorksheets?: boolean;
  hasUpcomingSessions?: boolean;
}

/**
 * @deprecated Use usePatientsList instead
 * This hook is kept for backward compatibility during the migration from mock data
 */
export function usePatientsData() {
  // Use the new React Query hook
  const { data: rawPatients, isLoading, error } = usePatientsList();
  
  // Transform data for backward compatibility
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<PatientFilters>({
    status: 'all',
  });

  // Convert PatientData to legacy Patient format
  const patients: Patient[] = (rawPatients || []).map((patient: PatientData) => ({
    ...patient,
    status: 'active' as const, // Default status
    progress: Math.round((patient.currentSession / patient.totalSessions) * 100) || 0,
    assignedAt: new Date().toISOString(), // Default assignment date
  }));

  // Legacy function - now handled by React Query
  const fetchPatients = useCallback(async () => {
    // No-op - data fetching is handled by React Query
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

  // Search patients - simplified for legacy compatibility
  const searchPatients = async (query: string) => {
    setSearchQuery(query);
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

  // Legacy functions - simplified for compatibility
  const addPatient = (newPatient: Patient) => {
    // No-op - mutations should use React Query hooks
  };

  const updatePatient = (patientId: string, updates: Partial<Patient>) => {
    // No-op - mutations should use React Query hooks
  };

  const removePatient = (patientId: string) => {
    // No-op - mutations should use React Query hooks
  };

  const refreshPatients = () => {
    // No-op - React Query handles refetching
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