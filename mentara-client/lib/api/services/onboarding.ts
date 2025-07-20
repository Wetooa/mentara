import { AxiosInstance } from 'axios';

// Onboarding response types
export interface OnboardingStep {
  step: string;
  completed: boolean;
  completedAt?: Date;
  required: boolean;
}

export interface OnboardingStatus {
  userId: string;
  role: string;
  overallProgress: number;
  steps: OnboardingStep[];
  isComplete: boolean;
  nextStep?: string;
}

export interface OnboardingValidation {
  isComplete: boolean;
  missingSteps: string[];
  canProceed: boolean;
}

export interface OnboardingInsights {
  totalUsers: number;
  completeOnboarding: number;
  incompleteOnboarding: number;
  averageProgress: number;
  commonDropoffSteps: string[];
}

export interface OnboardingService {
  getMyOnboardingStatus(): Promise<OnboardingStatus>;
  getUserOnboardingStatus(userId: string): Promise<OnboardingStatus>;
  completeStep(stepName: string): Promise<OnboardingStatus>;
  validateOnboarding(): Promise<OnboardingValidation>;
  getOnboardingInsights(): Promise<OnboardingInsights>;
}

export const createOnboardingService = (client: AxiosInstance): OnboardingService => ({
  getMyOnboardingStatus: async (): Promise<OnboardingStatus> => {
    const response = await client.get('/onboarding/status');
    return response.data;
  },

  getUserOnboardingStatus: async (userId: string): Promise<OnboardingStatus> => {
    const response = await client.get(`/onboarding/status/${userId}`);
    return response.data;
  },

  completeStep: async (stepName: string): Promise<OnboardingStatus> => {
    const response = await client.post(`/onboarding/complete-step/${stepName}`);
    return response.data;
  },

  validateOnboarding: async (): Promise<OnboardingValidation> => {
    const response = await client.get('/onboarding/validate');
    return response.data;
  },

  getOnboardingInsights: async (): Promise<OnboardingInsights> => {
    const response = await client.get('/onboarding/insights');
    return response.data;
  },
});