"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingStepParamSchema = exports.TherapistOnboardingDtoSchema = exports.ClientOnboardingDtoSchema = exports.UpdateOnboardingDataDtoSchema = exports.SkipStepDtoSchema = exports.CompleteStepDtoSchema = exports.OnboardingProgressSchema = exports.OnboardingStepSchema = void 0;
const zod_1 = require("zod");
// Onboarding Step Schema
exports.OnboardingStepSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    order: zod_1.z.number(),
    isRequired: zod_1.z.boolean(),
    isCompleted: zod_1.z.boolean(),
    completedAt: zod_1.z.string().datetime().optional()
});
// User Onboarding Progress Schema
exports.OnboardingProgressSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    currentStep: zod_1.z.number(),
    totalSteps: zod_1.z.number(),
    completedSteps: zod_1.z.array(zod_1.z.string()),
    isCompleted: zod_1.z.boolean(),
    startedAt: zod_1.z.string().datetime(),
    completedAt: zod_1.z.string().datetime().optional()
});
// Complete Onboarding Step Schema
exports.CompleteStepDtoSchema = zod_1.z.object({
    stepId: zod_1.z.string().min(1, 'Step ID is required'),
    data: zod_1.z.record(zod_1.z.any()).optional()
});
// Skip Onboarding Step Schema
exports.SkipStepDtoSchema = zod_1.z.object({
    stepId: zod_1.z.string().min(1, 'Step ID is required'),
    reason: zod_1.z.string().optional()
});
// Update Onboarding Data Schema
exports.UpdateOnboardingDataDtoSchema = zod_1.z.object({
    profileComplete: zod_1.z.boolean().optional(),
    preferencesSet: zod_1.z.boolean().optional(),
    firstSessionBooked: zod_1.z.boolean().optional(),
    tourCompleted: zod_1.z.boolean().optional(),
    notificationsConfigured: zod_1.z.boolean().optional(),
    paymentMethodAdded: zod_1.z.boolean().optional()
});
// Client Onboarding Schema
exports.ClientOnboardingDtoSchema = zod_1.z.object({
    personalInfo: zod_1.z.object({
        firstName: zod_1.z.string().min(1, 'First name is required'),
        lastName: zod_1.z.string().min(1, 'Last name is required'),
        birthDate: zod_1.z.string().datetime().optional(),
        phoneNumber: zod_1.z.string().optional()
    }),
    preferences: zod_1.z.object({
        therapistGender: zod_1.z.enum(['male', 'female', 'no_preference']).optional(),
        sessionType: zod_1.z.enum(['video', 'audio', 'text', 'no_preference']).optional(),
        specialties: zod_1.z.array(zod_1.z.string()).optional(),
        availability: zod_1.z.array(zod_1.z.string()).optional()
    }),
    mentalHealthInfo: zod_1.z.object({
        previousTherapy: zod_1.z.boolean().optional(),
        currentMedications: zod_1.z.boolean().optional(),
        emergencyContact: zod_1.z.string().optional()
    }).optional()
});
// Therapist Onboarding Schema
exports.TherapistOnboardingDtoSchema = zod_1.z.object({
    professionalInfo: zod_1.z.object({
        licenseNumber: zod_1.z.string().min(1, 'License number is required'),
        licenseType: zod_1.z.string().min(1, 'License type is required'),
        experienceYears: zod_1.z.number().min(0, 'Experience years must be positive'),
        specialties: zod_1.z.array(zod_1.z.string()).min(1, 'At least one specialty is required'),
        bio: zod_1.z.string().min(50, 'Bio must be at least 50 characters')
    }),
    availabilityInfo: zod_1.z.object({
        hourlyRate: zod_1.z.number().min(1, 'Hourly rate must be greater than 0'),
        timezone: zod_1.z.string(),
        weeklyAvailability: zod_1.z.array(zod_1.z.object({
            day: zod_1.z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
            startTime: zod_1.z.string(),
            endTime: zod_1.z.string()
        }))
    }),
    verificationInfo: zod_1.z.object({
        diploma: zod_1.z.string().url().optional(),
        license: zod_1.z.string().url().optional(),
        references: zod_1.z.array(zod_1.z.string()).optional()
    }).optional()
});
// Parameter Schemas
exports.OnboardingStepParamSchema = zod_1.z.object({
    stepId: zod_1.z.string().min(1, 'Step ID is required')
});
//# sourceMappingURL=onboarding.js.map