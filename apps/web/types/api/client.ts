// Client DTOs matching backend exactly

export interface OnboardingData {
  profile: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelationship: string;
    medicalHistory?: string;
    currentMedications?: string;
    allergies?: string;
  };
  goals: {
    treatmentGoals: string[];
    specificConcerns?: string;
    previousTreatment: boolean;
    previousTreatmentDetails?: string;
    urgencyLevel: "low" | "moderate" | "high" | "crisis";
    preferredOutcome: string;
    additionalNotes?: string;
  };
  preferences: {
    genderPreference: string;
    agePreference: string;
    languagePreferences?: string[];
    treatmentApproaches: string[];
    sessionFormat: string;
    sessionFrequency: string;
    budgetRange: string;
    locationPreference?: string;
    availabilityPreference?: string[];
    specialConsiderations?: string;
  };
}

export interface ClientProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  gender?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  medicalHistory?: string;
  currentMedications?: string;
  allergies?: string;
  treatmentGoals?: string[];
  assignedTherapistId?: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientProgress {
  totalSessions: number;
  completedWorksheets: number;
  currentStreak: number;
  moodTrends: Array<{
    date: string;
    mood: number;
    notes?: string;
  }>;
  goalProgress: Array<{
    goal: string;
    progress: number;
    status: "not-started" | "in-progress" | "completed";
  }>;
}

export interface AssignedTherapist {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  specialties: string[];
  hourlyRate: number;
  experience: number;
  bio?: string;
  profileImage?: string;
  rating?: number;
  totalReviews?: number;
  availability?: {
    timezone: string;
    weeklySchedule: Record<string, Array<{ start: string; end: string }>>;
  };
}

export interface AssessmentSubmission {
  responses: Record<string, any>;
  assessmentType: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface AssessmentResults {
  id: string;
  scores: Record<string, number>;
  recommendations: string[];
  riskLevel: "low" | "moderate" | "high" | "crisis";
  suggestedActions: string[];
  processedAt: string;
}