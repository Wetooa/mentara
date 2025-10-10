// Patient interface for therapist patient management
export interface Patient {
  id: string;
  name: string;
  fullName: string;
  avatar: string | null;
  email: string;
  phone: string;
  age: number;
  diagnosis: string;
  treatmentPlan: string;
  currentSession: number;
  totalSessions: number;
  status: "active" | "inactive" | "completed" | "pending";
  assignedAt?: string;
  lastSession?: string;
  nextSession?: string;
  progress: number; // 0-100 percentage
  sessions: SessionInfo[];
  worksheets: WorksheetInfo[];
}

// Session information for patient
export interface SessionInfo {
  id: string;
  number: number;
  date: string;
  duration?: number;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  notes: string;
  meetingType?: "video" | "audio" | "chat";
  meetingUrl?: string;
}

// Worksheet information for patient
export interface WorksheetInfo {
  id: string;
  title: string;
  assignedDate: string;
  dueDate?: string;
  status: "pending" | "completed" | "overdue" | "reviewed";
  instructions?: string;
  progress: number; // 0-100 percentage
}

// Session notes for detailed clinical documentation
export interface SessionNote {
  id: string;
  sessionId: string;
  patientId: string;
  therapistId: string;
  noteType: "session" | "treatment" | "clinical" | "progress";
  title: string;
  content: string;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

// Treatment goals for progress tracking
export interface TreatmentGoal {
  id: string;
  patientId: string;
  therapistId: string;
  title: string;
  description: string;
  targetDate: string;
  status: "active" | "completed" | "cancelled" | "on_hold";
  progress: number; // 0-100 percentage
  priority: "low" | "medium" | "high";
  category: string;
  createdAt: string;
  updatedAt: string;
}

// Progress metrics for tracking patient improvements
export interface ProgressMetric {
  id: string;
  patientId: string;
  metricType: string; // anxiety_level, depression_score, etc.
  value: number;
  unit: string;
  recordedDate: string;
  notes?: string;
  source: "self_report" | "assessment" | "observation";
}

// Patient filtering and search options
export interface PatientFilters {
  status?: "active" | "inactive" | "completed" | "all";
  diagnosis?: string;
  treatmentPlan?: string;
  progressRange?: {
    min: number;
    max: number;
  };
  sessionRange?: {
    min: number;
    max: number;
  };
  assignedDateRange?: {
    start: string;
    end: string;
  };
  hasOverdueWorksheets?: boolean;
  hasUpcomingSessions?: boolean;
}

// Patient statistics for dashboard
export interface PatientStatistics {
  totalPatients: number;
  activePatients: number;
  completedTreatments: number;
  averageProgress: number;
  upcomingSessions: number;
  overdueWorksheets: number;
  recentAssignments: number;
}

// Treatment plan template
export interface TreatmentPlanTemplate {
  id: string;
  name: string;
  description: string;
  diagnosis: string;
  estimatedSessions: number;
  goals: string[];
  interventions: string[];
  assessments: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

// Clinical assessment result
export interface ClinicalAssessment {
  id: string;
  patientId: string;
  therapistId: string;
  assessmentType: string;
  title: string;
  score: number;
  interpretation: string;
  recommendations: string[];
  assessmentDate: string;
  nextAssessmentDate?: string;
  results: Record<string, any>;
}
