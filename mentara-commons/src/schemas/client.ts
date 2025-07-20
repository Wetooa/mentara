import { z } from 'zod';

// Client-specific data structures moved from frontend services
export const ClientProfileSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['client', 'therapist', 'moderator', 'admin']),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // Client-specific fields
  isOnboardingComplete: z.boolean(),
  therapistId: z.string().uuid().optional(),
  preferences: z.object({
    therapistGender: z.string().optional(),
    sessionType: z.string().optional(),
    specialties: z.array(z.string()).optional(),
    availability: z.array(z.string()).optional()
  }).optional(),
  mentalHealthInfo: z.object({
    previousTherapy: z.boolean().optional(),
    currentMedications: z.array(z.string()).optional(),
    emergencyContact: z.object({
      name: z.string().min(1),
      relationship: z.string().min(1),
      phone: z.string().min(1)
    }).optional()
  }).optional()
});

export const ClientProgressSchema = z.object({
  completedSessions: z.number().min(0),
  totalSessions: z.number().min(0),
  currentGoals: z.array(z.string()),
  achievedGoals: z.array(z.string()),
  overallProgress: z.number().min(0).max(100),
  recentActivity: z.array(z.object({
    date: z.string().datetime(),
    type: z.string().min(1),
    description: z.string().min(1)
  })),
  wellnessScores: z.object({
    mood: z.number().min(0).max(100),
    anxiety: z.number().min(0).max(100),
    depression: z.number().min(0).max(100),
    functioning: z.number().min(0).max(100)
  })
});

export const AssignedTherapistSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  profileImage: z.string().url().optional(),
  specialties: z.array(z.string()),
  experience: z.number().min(0),
  bio: z.string().min(1),
  nextAvailableSlot: z.string().datetime().optional(),
  isActive: z.boolean()
});

export const AssessmentSubmissionSchema = z.object({
  questionnaires: z.record(z.any()),
  answers: z.array(z.object({
    questionId: z.string().uuid(),
    answer: z.any()
  })),
  metadata: z.record(z.any()).optional()
});

export const AssessmentResultsSchema = z.object({
  id: z.string().uuid(),
  overallScore: z.number().min(0).max(100),
  scores: z.record(z.string(), z.number()),
  recommendations: z.array(z.string()),
  riskLevel: z.enum(['low', 'medium', 'high']),
  followUpRequired: z.boolean()
});

export const OnboardingDataSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    birthDate: z.string().datetime(),
    phoneNumber: z.string().min(1)
  }),
  preferences: z.object({
    therapistGender: z.string().optional(),
    sessionType: z.string().optional(),
    specialties: z.array(z.string()).optional(),
    availability: z.array(z.string()).optional()
  }),
  mentalHealthInfo: z.object({
    previousTherapy: z.boolean().optional(),
    currentMedications: z.array(z.string()).optional(),
    emergencyContact: z.object({
      name: z.string().min(1),
      relationship: z.string().min(1),
      phone: z.string().min(1)
    }).optional()
  }),
  goals: z.array(z.string())
});

// Export type inference helpers
export type ClientProfile = z.infer<typeof ClientProfileSchema>;
export type ClientProgress = z.infer<typeof ClientProgressSchema>;
export type AssignedTherapist = z.infer<typeof AssignedTherapistSchema>;
export type AssessmentSubmission = z.infer<typeof AssessmentSubmissionSchema>;
export type AssessmentResults = z.infer<typeof AssessmentResultsSchema>;
export type OnboardingData = z.infer<typeof OnboardingDataSchema>;