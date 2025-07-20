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

// Export auth types
export * from './auth';
