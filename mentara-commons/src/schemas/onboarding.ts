import { z } from 'zod';

// Onboarding Step Schema
export const OnboardingStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
  isRequired: z.boolean(),
  isCompleted: z.boolean(),
  completedAt: z.string().datetime().optional()
});

// User Onboarding Progress Schema
export const OnboardingProgressSchema = z.object({
  userId: z.string().uuid(),
  currentStep: z.number(),
  totalSteps: z.number(),
  completedSteps: z.array(z.string()),
  isCompleted: z.boolean(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional()
});

// Complete Onboarding Step Schema
export const CompleteStepDtoSchema = z.object({
  stepId: z.string().min(1, 'Step ID is required'),
  data: z.record(z.any()).optional()
});

// Skip Onboarding Step Schema
export const SkipStepDtoSchema = z.object({
  stepId: z.string().min(1, 'Step ID is required'),
  reason: z.string().optional()
});

// Update Onboarding Data Schema
export const UpdateOnboardingDataDtoSchema = z.object({
  profileComplete: z.boolean().optional(),
  preferencesSet: z.boolean().optional(),
  firstSessionBooked: z.boolean().optional(),
  tourCompleted: z.boolean().optional(),
  notificationsConfigured: z.boolean().optional(),
  paymentMethodAdded: z.boolean().optional()
});

// Client Onboarding Schema
export const ClientOnboardingDtoSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    birthDate: z.string().datetime().optional(),
    phoneNumber: z.string().optional()
  }),
  preferences: z.object({
    therapistGender: z.enum(['male', 'female', 'no_preference']).optional(),
    sessionType: z.enum(['video', 'audio', 'text', 'no_preference']).optional(),
    specialties: z.array(z.string()).optional(),
    availability: z.array(z.string()).optional()
  }),
  mentalHealthInfo: z.object({
    previousTherapy: z.boolean().optional(),
    currentMedications: z.boolean().optional(),
    emergencyContact: z.string().optional()
  }).optional()
});

// Therapist Onboarding Schema
export const TherapistOnboardingDtoSchema = z.object({
  professionalInfo: z.object({
    licenseNumber: z.string().min(1, 'License number is required'),
    licenseType: z.string().min(1, 'License type is required'),
    experienceYears: z.number().min(0, 'Experience years must be positive'),
    specialties: z.array(z.string()).min(1, 'At least one specialty is required'),
    bio: z.string().min(50, 'Bio must be at least 50 characters')
  }),
  availabilityInfo: z.object({
    hourlyRate: z.number().min(1, 'Hourly rate must be greater than 0'),
    timezone: z.string(),
    weeklyAvailability: z.array(z.object({
      day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
      startTime: z.string(),
      endTime: z.string()
    }))
  }),
  verificationInfo: z.object({
    diploma: z.string().url().optional(),
    license: z.string().url().optional(),
    references: z.array(z.string()).optional()
  }).optional()
});

// Parameter Schemas
export const OnboardingStepParamSchema = z.object({
  stepId: z.string().min(1, 'Step ID is required')
});

// Export type inference helpers
export type OnboardingStep = z.infer<typeof OnboardingStepSchema>;
export type OnboardingProgress = z.infer<typeof OnboardingProgressSchema>;
export type CompleteStepDto = z.infer<typeof CompleteStepDtoSchema>;
export type SkipStepDto = z.infer<typeof SkipStepDtoSchema>;
export type UpdateOnboardingDataDto = z.infer<typeof UpdateOnboardingDataDtoSchema>;
export type ClientOnboardingDto = z.infer<typeof ClientOnboardingDtoSchema>;
export type TherapistOnboardingDto = z.infer<typeof TherapistOnboardingDtoSchema>;
export type OnboardingStepParam = z.infer<typeof OnboardingStepParamSchema>;