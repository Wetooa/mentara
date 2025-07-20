import { z } from 'zod';
export declare const ClientProfileSchema: z.ZodObject<{
    id: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    role: z.ZodEnum<["client", "therapist", "moderator", "admin"]>;
    isActive: z.ZodBoolean;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    isOnboardingComplete: z.ZodBoolean;
    therapistId: z.ZodOptional<z.ZodString>;
    preferences: z.ZodOptional<z.ZodObject<{
        therapistGender: z.ZodOptional<z.ZodString>;
        sessionType: z.ZodOptional<z.ZodString>;
        specialties: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        availability: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        sessionType?: string | undefined;
        therapistGender?: string | undefined;
        specialties?: string[] | undefined;
        availability?: string[] | undefined;
    }, {
        sessionType?: string | undefined;
        therapistGender?: string | undefined;
        specialties?: string[] | undefined;
        availability?: string[] | undefined;
    }>>;
    mentalHealthInfo: z.ZodOptional<z.ZodObject<{
        previousTherapy: z.ZodOptional<z.ZodBoolean>;
        currentMedications: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        emergencyContact: z.ZodOptional<z.ZodObject<{
            name: z.ZodString;
            relationship: z.ZodString;
            phone: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            phone: string;
            name: string;
            relationship: string;
        }, {
            phone: string;
            name: string;
            relationship: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        previousTherapy?: boolean | undefined;
        currentMedications?: string[] | undefined;
        emergencyContact?: {
            phone: string;
            name: string;
            relationship: string;
        } | undefined;
    }, {
        previousTherapy?: boolean | undefined;
        currentMedications?: string[] | undefined;
        emergencyContact?: {
            phone: string;
            name: string;
            relationship: string;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName: string;
    lastName: string;
    role: "client" | "therapist" | "moderator" | "admin";
    id: string;
    createdAt: string;
    isActive: boolean;
    updatedAt: string;
    isOnboardingComplete: boolean;
    therapistId?: string | undefined;
    preferences?: {
        sessionType?: string | undefined;
        therapistGender?: string | undefined;
        specialties?: string[] | undefined;
        availability?: string[] | undefined;
    } | undefined;
    mentalHealthInfo?: {
        previousTherapy?: boolean | undefined;
        currentMedications?: string[] | undefined;
        emergencyContact?: {
            phone: string;
            name: string;
            relationship: string;
        } | undefined;
    } | undefined;
}, {
    email: string;
    firstName: string;
    lastName: string;
    role: "client" | "therapist" | "moderator" | "admin";
    id: string;
    createdAt: string;
    isActive: boolean;
    updatedAt: string;
    isOnboardingComplete: boolean;
    therapistId?: string | undefined;
    preferences?: {
        sessionType?: string | undefined;
        therapistGender?: string | undefined;
        specialties?: string[] | undefined;
        availability?: string[] | undefined;
    } | undefined;
    mentalHealthInfo?: {
        previousTherapy?: boolean | undefined;
        currentMedications?: string[] | undefined;
        emergencyContact?: {
            phone: string;
            name: string;
            relationship: string;
        } | undefined;
    } | undefined;
}>;
export declare const ClientProgressSchema: z.ZodObject<{
    completedSessions: z.ZodNumber;
    totalSessions: z.ZodNumber;
    currentGoals: z.ZodArray<z.ZodString, "many">;
    achievedGoals: z.ZodArray<z.ZodString, "many">;
    overallProgress: z.ZodNumber;
    recentActivity: z.ZodArray<z.ZodObject<{
        date: z.ZodString;
        type: z.ZodString;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        date: string;
        description: string;
    }, {
        type: string;
        date: string;
        description: string;
    }>, "many">;
    wellnessScores: z.ZodObject<{
        mood: z.ZodNumber;
        anxiety: z.ZodNumber;
        depression: z.ZodNumber;
        functioning: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        mood: number;
        anxiety: number;
        depression: number;
        functioning: number;
    }, {
        mood: number;
        anxiety: number;
        depression: number;
        functioning: number;
    }>;
}, "strip", z.ZodTypeAny, {
    totalSessions: number;
    completedSessions: number;
    recentActivity: {
        type: string;
        date: string;
        description: string;
    }[];
    currentGoals: string[];
    achievedGoals: string[];
    overallProgress: number;
    wellnessScores: {
        mood: number;
        anxiety: number;
        depression: number;
        functioning: number;
    };
}, {
    totalSessions: number;
    completedSessions: number;
    recentActivity: {
        type: string;
        date: string;
        description: string;
    }[];
    currentGoals: string[];
    achievedGoals: string[];
    overallProgress: number;
    wellnessScores: {
        mood: number;
        anxiety: number;
        depression: number;
        functioning: number;
    };
}>;
export declare const AssignedTherapistSchema: z.ZodObject<{
    id: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    profileImage: z.ZodOptional<z.ZodString>;
    specialties: z.ZodArray<z.ZodString, "many">;
    experience: z.ZodNumber;
    bio: z.ZodString;
    nextAvailableSlot: z.ZodOptional<z.ZodString>;
    isActive: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    id: string;
    bio: string;
    isActive: boolean;
    specialties: string[];
    experience: number;
    profileImage?: string | undefined;
    nextAvailableSlot?: string | undefined;
}, {
    firstName: string;
    lastName: string;
    id: string;
    bio: string;
    isActive: boolean;
    specialties: string[];
    experience: number;
    profileImage?: string | undefined;
    nextAvailableSlot?: string | undefined;
}>;
export declare const AssessmentSubmissionSchema: z.ZodObject<{
    questionnaires: z.ZodRecord<z.ZodString, z.ZodAny>;
    answers: z.ZodArray<z.ZodObject<{
        questionId: z.ZodString;
        answer: z.ZodAny;
    }, "strip", z.ZodTypeAny, {
        questionId: string;
        answer?: any;
    }, {
        questionId: string;
        answer?: any;
    }>, "many">;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    questionnaires: Record<string, any>;
    answers: {
        questionId: string;
        answer?: any;
    }[];
    metadata?: Record<string, any> | undefined;
}, {
    questionnaires: Record<string, any>;
    answers: {
        questionId: string;
        answer?: any;
    }[];
    metadata?: Record<string, any> | undefined;
}>;
export declare const AssessmentResultsSchema: z.ZodObject<{
    id: z.ZodString;
    overallScore: z.ZodNumber;
    scores: z.ZodRecord<z.ZodString, z.ZodNumber>;
    recommendations: z.ZodArray<z.ZodString, "many">;
    riskLevel: z.ZodEnum<["low", "medium", "high"]>;
    followUpRequired: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: string;
    followUpRequired: boolean;
    recommendations: string[];
    scores: Record<string, number>;
    overallScore: number;
    riskLevel: "high" | "medium" | "low";
}, {
    id: string;
    followUpRequired: boolean;
    recommendations: string[];
    scores: Record<string, number>;
    overallScore: number;
    riskLevel: "high" | "medium" | "low";
}>;
export declare const OnboardingDataSchema: z.ZodObject<{
    personalInfo: z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        birthDate: z.ZodString;
        phoneNumber: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        firstName: string;
        lastName: string;
        phoneNumber: string;
        birthDate: string;
    }, {
        firstName: string;
        lastName: string;
        phoneNumber: string;
        birthDate: string;
    }>;
    preferences: z.ZodObject<{
        therapistGender: z.ZodOptional<z.ZodString>;
        sessionType: z.ZodOptional<z.ZodString>;
        specialties: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        availability: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        sessionType?: string | undefined;
        therapistGender?: string | undefined;
        specialties?: string[] | undefined;
        availability?: string[] | undefined;
    }, {
        sessionType?: string | undefined;
        therapistGender?: string | undefined;
        specialties?: string[] | undefined;
        availability?: string[] | undefined;
    }>;
    mentalHealthInfo: z.ZodObject<{
        previousTherapy: z.ZodOptional<z.ZodBoolean>;
        currentMedications: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        emergencyContact: z.ZodOptional<z.ZodObject<{
            name: z.ZodString;
            relationship: z.ZodString;
            phone: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            phone: string;
            name: string;
            relationship: string;
        }, {
            phone: string;
            name: string;
            relationship: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        previousTherapy?: boolean | undefined;
        currentMedications?: string[] | undefined;
        emergencyContact?: {
            phone: string;
            name: string;
            relationship: string;
        } | undefined;
    }, {
        previousTherapy?: boolean | undefined;
        currentMedications?: string[] | undefined;
        emergencyContact?: {
            phone: string;
            name: string;
            relationship: string;
        } | undefined;
    }>;
    goals: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    goals: string[];
    personalInfo: {
        firstName: string;
        lastName: string;
        phoneNumber: string;
        birthDate: string;
    };
    preferences: {
        sessionType?: string | undefined;
        therapistGender?: string | undefined;
        specialties?: string[] | undefined;
        availability?: string[] | undefined;
    };
    mentalHealthInfo: {
        previousTherapy?: boolean | undefined;
        currentMedications?: string[] | undefined;
        emergencyContact?: {
            phone: string;
            name: string;
            relationship: string;
        } | undefined;
    };
}, {
    goals: string[];
    personalInfo: {
        firstName: string;
        lastName: string;
        phoneNumber: string;
        birthDate: string;
    };
    preferences: {
        sessionType?: string | undefined;
        therapistGender?: string | undefined;
        specialties?: string[] | undefined;
        availability?: string[] | undefined;
    };
    mentalHealthInfo: {
        previousTherapy?: boolean | undefined;
        currentMedications?: string[] | undefined;
        emergencyContact?: {
            phone: string;
            name: string;
            relationship: string;
        } | undefined;
    };
}>;
export type ClientProfile = z.infer<typeof ClientProfileSchema>;
export type ClientProgress = z.infer<typeof ClientProgressSchema>;
export type AssignedTherapist = z.infer<typeof AssignedTherapistSchema>;
export type AssessmentSubmission = z.infer<typeof AssessmentSubmissionSchema>;
export type AssessmentResults = z.infer<typeof AssessmentResultsSchema>;
export type OnboardingData = z.infer<typeof OnboardingDataSchema>;
//# sourceMappingURL=client.d.ts.map