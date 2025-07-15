import { z } from 'zod';
export declare const OnboardingStepSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    order: z.ZodNumber;
    isRequired: z.ZodBoolean;
    isCompleted: z.ZodBoolean;
    completedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    description: string;
    order: number;
    isRequired: boolean;
    isCompleted: boolean;
    completedAt?: string | undefined;
}, {
    id: string;
    title: string;
    description: string;
    order: number;
    isRequired: boolean;
    isCompleted: boolean;
    completedAt?: string | undefined;
}>;
export declare const OnboardingProgressSchema: z.ZodObject<{
    userId: z.ZodString;
    currentStep: z.ZodNumber;
    totalSteps: z.ZodNumber;
    completedSteps: z.ZodArray<z.ZodString, "many">;
    isCompleted: z.ZodBoolean;
    startedAt: z.ZodString;
    completedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    isCompleted: boolean;
    currentStep: number;
    totalSteps: number;
    completedSteps: string[];
    startedAt: string;
    completedAt?: string | undefined;
}, {
    userId: string;
    isCompleted: boolean;
    currentStep: number;
    totalSteps: number;
    completedSteps: string[];
    startedAt: string;
    completedAt?: string | undefined;
}>;
export declare const CompleteStepDtoSchema: z.ZodObject<{
    stepId: z.ZodString;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    stepId: string;
    data?: Record<string, any> | undefined;
}, {
    stepId: string;
    data?: Record<string, any> | undefined;
}>;
export declare const SkipStepDtoSchema: z.ZodObject<{
    stepId: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    stepId: string;
    reason?: string | undefined;
}, {
    stepId: string;
    reason?: string | undefined;
}>;
export declare const UpdateOnboardingDataDtoSchema: z.ZodObject<{
    profileComplete: z.ZodOptional<z.ZodBoolean>;
    preferencesSet: z.ZodOptional<z.ZodBoolean>;
    firstSessionBooked: z.ZodOptional<z.ZodBoolean>;
    tourCompleted: z.ZodOptional<z.ZodBoolean>;
    notificationsConfigured: z.ZodOptional<z.ZodBoolean>;
    paymentMethodAdded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    profileComplete?: boolean | undefined;
    preferencesSet?: boolean | undefined;
    firstSessionBooked?: boolean | undefined;
    tourCompleted?: boolean | undefined;
    notificationsConfigured?: boolean | undefined;
    paymentMethodAdded?: boolean | undefined;
}, {
    profileComplete?: boolean | undefined;
    preferencesSet?: boolean | undefined;
    firstSessionBooked?: boolean | undefined;
    tourCompleted?: boolean | undefined;
    notificationsConfigured?: boolean | undefined;
    paymentMethodAdded?: boolean | undefined;
}>;
export declare const ClientOnboardingDtoSchema: z.ZodObject<{
    personalInfo: z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        birthDate: z.ZodOptional<z.ZodString>;
        phoneNumber: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        firstName: string;
        lastName: string;
        birthDate?: string | undefined;
        phoneNumber?: string | undefined;
    }, {
        firstName: string;
        lastName: string;
        birthDate?: string | undefined;
        phoneNumber?: string | undefined;
    }>;
    preferences: z.ZodObject<{
        therapistGender: z.ZodOptional<z.ZodEnum<["male", "female", "no_preference"]>>;
        sessionType: z.ZodOptional<z.ZodEnum<["video", "audio", "text", "no_preference"]>>;
        specialties: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        availability: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        specialties?: string[] | undefined;
        availability?: string[] | undefined;
        therapistGender?: "male" | "female" | "no_preference" | undefined;
        sessionType?: "video" | "audio" | "text" | "no_preference" | undefined;
    }, {
        specialties?: string[] | undefined;
        availability?: string[] | undefined;
        therapistGender?: "male" | "female" | "no_preference" | undefined;
        sessionType?: "video" | "audio" | "text" | "no_preference" | undefined;
    }>;
    mentalHealthInfo: z.ZodOptional<z.ZodObject<{
        previousTherapy: z.ZodOptional<z.ZodBoolean>;
        currentMedications: z.ZodOptional<z.ZodBoolean>;
        emergencyContact: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        previousTherapy?: boolean | undefined;
        currentMedications?: boolean | undefined;
        emergencyContact?: string | undefined;
    }, {
        previousTherapy?: boolean | undefined;
        currentMedications?: boolean | undefined;
        emergencyContact?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    personalInfo: {
        firstName: string;
        lastName: string;
        birthDate?: string | undefined;
        phoneNumber?: string | undefined;
    };
    preferences: {
        specialties?: string[] | undefined;
        availability?: string[] | undefined;
        therapistGender?: "male" | "female" | "no_preference" | undefined;
        sessionType?: "video" | "audio" | "text" | "no_preference" | undefined;
    };
    mentalHealthInfo?: {
        previousTherapy?: boolean | undefined;
        currentMedications?: boolean | undefined;
        emergencyContact?: string | undefined;
    } | undefined;
}, {
    personalInfo: {
        firstName: string;
        lastName: string;
        birthDate?: string | undefined;
        phoneNumber?: string | undefined;
    };
    preferences: {
        specialties?: string[] | undefined;
        availability?: string[] | undefined;
        therapistGender?: "male" | "female" | "no_preference" | undefined;
        sessionType?: "video" | "audio" | "text" | "no_preference" | undefined;
    };
    mentalHealthInfo?: {
        previousTherapy?: boolean | undefined;
        currentMedications?: boolean | undefined;
        emergencyContact?: string | undefined;
    } | undefined;
}>;
export declare const TherapistOnboardingDtoSchema: z.ZodObject<{
    professionalInfo: z.ZodObject<{
        licenseNumber: z.ZodString;
        licenseType: z.ZodString;
        experienceYears: z.ZodNumber;
        specialties: z.ZodArray<z.ZodString, "many">;
        bio: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        bio: string;
        specialties: string[];
        licenseNumber: string;
        licenseType: string;
        experienceYears: number;
    }, {
        bio: string;
        specialties: string[];
        licenseNumber: string;
        licenseType: string;
        experienceYears: number;
    }>;
    availabilityInfo: z.ZodObject<{
        hourlyRate: z.ZodNumber;
        timezone: z.ZodString;
        weeklyAvailability: z.ZodArray<z.ZodObject<{
            day: z.ZodEnum<["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]>;
            startTime: z.ZodString;
            endTime: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            startTime: string;
            endTime: string;
            day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        }, {
            startTime: string;
            endTime: string;
            day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        weeklyAvailability: {
            startTime: string;
            endTime: string;
            day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        }[];
        hourlyRate: number;
        timezone: string;
    }, {
        weeklyAvailability: {
            startTime: string;
            endTime: string;
            day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        }[];
        hourlyRate: number;
        timezone: string;
    }>;
    verificationInfo: z.ZodOptional<z.ZodObject<{
        diploma: z.ZodOptional<z.ZodString>;
        license: z.ZodOptional<z.ZodString>;
        references: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        license?: string | undefined;
        diploma?: string | undefined;
        references?: string[] | undefined;
    }, {
        license?: string | undefined;
        diploma?: string | undefined;
        references?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    professionalInfo: {
        bio: string;
        specialties: string[];
        licenseNumber: string;
        licenseType: string;
        experienceYears: number;
    };
    availabilityInfo: {
        weeklyAvailability: {
            startTime: string;
            endTime: string;
            day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        }[];
        hourlyRate: number;
        timezone: string;
    };
    verificationInfo?: {
        license?: string | undefined;
        diploma?: string | undefined;
        references?: string[] | undefined;
    } | undefined;
}, {
    professionalInfo: {
        bio: string;
        specialties: string[];
        licenseNumber: string;
        licenseType: string;
        experienceYears: number;
    };
    availabilityInfo: {
        weeklyAvailability: {
            startTime: string;
            endTime: string;
            day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        }[];
        hourlyRate: number;
        timezone: string;
    };
    verificationInfo?: {
        license?: string | undefined;
        diploma?: string | undefined;
        references?: string[] | undefined;
    } | undefined;
}>;
export declare const OnboardingStepParamSchema: z.ZodObject<{
    stepId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    stepId: string;
}, {
    stepId: string;
}>;
export type OnboardingStep = z.infer<typeof OnboardingStepSchema>;
export type OnboardingProgress = z.infer<typeof OnboardingProgressSchema>;
export type CompleteStepDto = z.infer<typeof CompleteStepDtoSchema>;
export type SkipStepDto = z.infer<typeof SkipStepDtoSchema>;
export type UpdateOnboardingDataDto = z.infer<typeof UpdateOnboardingDataDtoSchema>;
export type ClientOnboardingDto = z.infer<typeof ClientOnboardingDtoSchema>;
export type TherapistOnboardingDto = z.infer<typeof TherapistOnboardingDtoSchema>;
export type OnboardingStepParam = z.infer<typeof OnboardingStepParamSchema>;
//# sourceMappingURL=onboarding.d.ts.map