/**
 * Central export file for all application types
 */

// Export domain types (business entities and enums)
export * from './domain';

// Export API response types
export * from './api-responses';

// Export authentication types
export * from './auth';

// Export other domain-specific types
export * from './booking';
export * from './review';
export * from './therapist';
export * from './patient';
export * from './filters';

// Export API types
export * from './api';

// Legacy types - keeping for backward compatibility but should be migrated
export interface Therapist {
  id: string;
  name: string;
  avatar: string;
}

export interface DashboardStats {
  activePatients: number;
  rescheduled: number;
  cancelled: number;
  income: number;
  patientStats: {
    total: number;
    percentage: number;
    months: number;
    chartData: Array<{ month: string; value: number }>;
  };
}

// Legacy appointment interface - use types/auth.ts Appointment instead for new code
export interface LegacyAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar: string;
  time: string;
  condition: string;
  reportId?: string;
}

export interface Session {
  id: string;
  number: number;
  date: string;
  notes: string;
}

export interface Worksheet {
  id: string;
  title: string;
  assignedDate: string;
  status: "completed" | "pending" | "overdue";
}

export interface Patient {
  id: string;
  name: string;
  fullName: string;
  avatar: string;
  email: string;
  phone: string;
  age: number;
  diagnosis: string;
  treatmentPlan: string;
  currentSession: number;
  totalSessions: number;
  sessions: Session[];
  worksheets: Worksheet[];
}
