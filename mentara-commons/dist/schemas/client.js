"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingDataSchema = exports.AssessmentResultsSchema = exports.AssessmentSubmissionSchema = exports.AssignedTherapistSchema = exports.ClientProgressSchema = exports.ClientProfileSchema = void 0;
const zod_1 = require("zod");
// Client-specific data structures moved from frontend services
exports.ClientProfileSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    role: zod_1.z.enum(['client', 'therapist', 'moderator', 'admin']),
    isActive: zod_1.z.boolean(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
    // Client-specific fields
    isOnboardingComplete: zod_1.z.boolean(),
    therapistId: zod_1.z.string().uuid().optional(),
    preferences: zod_1.z.object({
        therapistGender: zod_1.z.string().optional(),
        sessionType: zod_1.z.string().optional(),
        specialties: zod_1.z.array(zod_1.z.string()).optional(),
        availability: zod_1.z.array(zod_1.z.string()).optional()
    }).optional(),
    mentalHealthInfo: zod_1.z.object({
        previousTherapy: zod_1.z.boolean().optional(),
        currentMedications: zod_1.z.array(zod_1.z.string()).optional(),
        emergencyContact: zod_1.z.object({
            name: zod_1.z.string().min(1),
            relationship: zod_1.z.string().min(1),
            phone: zod_1.z.string().min(1)
        }).optional()
    }).optional()
});
exports.ClientProgressSchema = zod_1.z.object({
    completedSessions: zod_1.z.number().min(0),
    totalSessions: zod_1.z.number().min(0),
    currentGoals: zod_1.z.array(zod_1.z.string()),
    achievedGoals: zod_1.z.array(zod_1.z.string()),
    overallProgress: zod_1.z.number().min(0).max(100),
    recentActivity: zod_1.z.array(zod_1.z.object({
        date: zod_1.z.string().datetime(),
        type: zod_1.z.string().min(1),
        description: zod_1.z.string().min(1)
    })),
    wellnessScores: zod_1.z.object({
        mood: zod_1.z.number().min(0).max(100),
        anxiety: zod_1.z.number().min(0).max(100),
        depression: zod_1.z.number().min(0).max(100),
        functioning: zod_1.z.number().min(0).max(100)
    })
});
exports.AssignedTherapistSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    profileImage: zod_1.z.string().url().optional(),
    specialties: zod_1.z.array(zod_1.z.string()),
    experience: zod_1.z.number().min(0),
    bio: zod_1.z.string().min(1),
    nextAvailableSlot: zod_1.z.string().datetime().optional(),
    isActive: zod_1.z.boolean()
});
exports.AssessmentSubmissionSchema = zod_1.z.object({
    questionnaires: zod_1.z.record(zod_1.z.any()),
    answers: zod_1.z.array(zod_1.z.object({
        questionId: zod_1.z.string().uuid(),
        answer: zod_1.z.any()
    })),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
exports.AssessmentResultsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    overallScore: zod_1.z.number().min(0).max(100),
    scores: zod_1.z.record(zod_1.z.string(), zod_1.z.number()),
    recommendations: zod_1.z.array(zod_1.z.string()),
    riskLevel: zod_1.z.enum(['low', 'medium', 'high']),
    followUpRequired: zod_1.z.boolean()
});
exports.OnboardingDataSchema = zod_1.z.object({
    personalInfo: zod_1.z.object({
        firstName: zod_1.z.string().min(1),
        lastName: zod_1.z.string().min(1),
        birthDate: zod_1.z.string().datetime(),
        phoneNumber: zod_1.z.string().min(1)
    }),
    preferences: zod_1.z.object({
        therapistGender: zod_1.z.string().optional(),
        sessionType: zod_1.z.string().optional(),
        specialties: zod_1.z.array(zod_1.z.string()).optional(),
        availability: zod_1.z.array(zod_1.z.string()).optional()
    }),
    mentalHealthInfo: zod_1.z.object({
        previousTherapy: zod_1.z.boolean().optional(),
        currentMedications: zod_1.z.array(zod_1.z.string()).optional(),
        emergencyContact: zod_1.z.object({
            name: zod_1.z.string().min(1),
            relationship: zod_1.z.string().min(1),
            phone: zod_1.z.string().min(1)
        }).optional()
    }),
    goals: zod_1.z.array(zod_1.z.string())
});
//# sourceMappingURL=client.js.map