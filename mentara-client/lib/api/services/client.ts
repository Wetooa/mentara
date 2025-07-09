import { AxiosInstance } from 'axios';

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
    urgencyLevel: 'low' | 'moderate' | 'high' | 'crisis';
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
    status: 'not-started' | 'in-progress' | 'completed';
  }>;
}

export interface ClientService {
  completeOnboarding: (data: OnboardingData) => Promise<{ success: boolean; profile: ClientProfile }>;
  getProfile: () => Promise<ClientProfile>;
  updateProfile: (data: Partial<ClientProfile>) => Promise<ClientProfile>;
  getProgress: () => Promise<ClientProgress>;
  getAssignedTherapist: () => Promise<any>;
  submitAssessment: (assessmentData: any) => Promise<{ success: boolean; results: any }>;
  updatePreferences: (preferences: Partial<OnboardingData['preferences']>) => Promise<{ success: boolean }>;
  updateGoals: (goals: Partial<OnboardingData['goals']>) => Promise<{ success: boolean }>;
  markOnboardingComplete: () => Promise<{ success: boolean }>;
  requestTherapistChange: (reason: string) => Promise<{ success: boolean; requestId: string }>;
}

export const createClientService = (client: AxiosInstance): ClientService => ({
  completeOnboarding: (data: OnboardingData) =>
    client.post('/client/onboarding/complete', data),

  getProfile: () =>
    client.get('/client/profile'),

  updateProfile: (data: Partial<ClientProfile>) =>
    client.patch('/client/profile', data),

  getProgress: () =>
    client.get('/client/progress'),

  getAssignedTherapist: () =>
    client.get('/client/therapist'),

  submitAssessment: (assessmentData: any) =>
    client.post('/client/assessment/submit', assessmentData),

  updatePreferences: (preferences: Partial<OnboardingData['preferences']>) =>
    client.patch('/client/preferences', { preferences }),

  updateGoals: (goals: Partial<OnboardingData['goals']>) =>
    client.patch('/client/goals', { goals }),

  markOnboardingComplete: () =>
    client.post('/client/onboarding/complete-status'),

  requestTherapistChange: (reason: string) =>
    client.post('/client/therapist/change-request', { reason }),
});

export type { OnboardingData, ClientProfile, ClientProgress };