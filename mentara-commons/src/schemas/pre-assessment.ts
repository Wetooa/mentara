import { z } from 'zod';

// Assessment Scale Schema
export const AssessmentScaleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  questionCount: z.number(),
  minScore: z.number(),
  maxScore: z.number(),
  categories: z.array(z.string())
});

// Assessment Question Schema
export const AssessmentQuestionSchema = z.object({
  id: z.string(),
  scaleId: z.string(),
  text: z.string(),
  type: z.enum(['likert', 'yes_no', 'multiple_choice', 'text']),
  options: z.array(z.string()).optional(),
  order: z.number(),
  isRequired: z.boolean(),
  category: z.string().optional()
});

// Assessment Response Schema
export const AssessmentResponseSchema = z.object({
  questionId: z.string(),
  value: z.union([z.string(), z.number()]),
  textValue: z.string().optional()
});

// Pre-Assessment Schema
export const PreAssessmentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  responses: z.array(AssessmentResponseSchema),
  scores: z.record(z.number()),
  overallScore: z.number(),
  recommendations: z.array(z.string()),
  riskLevel: z.enum(['low', 'moderate', 'high', 'critical']),
  completedAt: z.string().datetime(),
  processedAt: z.string().datetime().optional(),
  isProcessed: z.boolean()
});

// Create Pre-Assessment Schema (updated from class-validator DTO)
export const CreatePreAssessmentDtoSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  questionnaires: z.array(z.string()).min(1, 'At least one questionnaire is required'),
  answers: z.array(z.array(z.number())).min(1, 'At least one answer set is required'),
  answerMatrix: z.array(z.number()).min(1, 'Answer matrix is required'),
  scores: z.record(z.number()),
  severityLevels: z.record(z.string()),
  metadata: z.record(z.any()).optional()
});

// Update Pre-Assessment Schema (updated from class-validator DTO)
export const UpdatePreAssessmentDtoSchema = z.object({
  questionnaires: z.array(z.string()).optional(),
  answers: z.array(z.array(z.number())).optional(),
  answerMatrix: z.array(z.number()).optional(),
  scores: z.record(z.number()).optional(),
  severityLevels: z.record(z.string()).optional(),
  metadata: z.record(z.any()).optional()
});

// Assessment Result Schema
export const AssessmentResultSchema = z.object({
  scales: z.record(z.object({
    score: z.number(),
    percentile: z.number(),
    category: z.string(),
    description: z.string()
  })),
  overallAssessment: z.object({
    riskLevel: z.enum(['low', 'moderate', 'high', 'critical']),
    summary: z.string(),
    recommendations: z.array(z.string()),
    urgentCare: z.boolean()
  }),
  therapeuticRecommendations: z.object({
    recommendedTherapyTypes: z.array(z.string()),
    recommendedSpecialties: z.array(z.string()),
    sessionFrequency: z.string(),
    priorityAreas: z.array(z.string())
  })
});

// Assessment Analytics Schema
export const AssessmentAnalyticsSchema = z.object({
  totalAssessments: z.number(),
  averageScore: z.number(),
  riskDistribution: z.record(z.number()),
  completionRate: z.number(),
  averageCompletionTime: z.number(),
  mostCommonRecommendations: z.array(z.string())
});

// Assessment Query Parameters
export const AssessmentQuerySchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  userId: z.string().uuid().optional(),
  riskLevel: z.enum(['low', 'moderate', 'high', 'critical']).optional(),
  isProcessed: z.boolean().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(['completedAt', 'overallScore', 'riskLevel']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Assessment Process Request Schema
export const ProcessAssessmentDtoSchema = z.object({
  assessmentId: z.string().uuid('Invalid assessment ID format'),
  forceReprocess: z.boolean().default(false)
});

// Assessment Export Schema
export const ExportAssessmentDtoSchema = z.object({
  assessmentIds: z.array(z.string().uuid()).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
  includePersonalInfo: z.boolean().default(false)
});

// Crisis Assessment Schema
export const CrisisAssessmentDtoSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  severity: z.enum(['low', 'moderate', 'high', 'critical']),
  symptoms: z.array(z.string()),
  immediateRisk: z.boolean(),
  supportNeeded: z.boolean(),
  notes: z.string().max(2000, 'Notes too long').optional()
});

// Parameter Schemas
export const AssessmentIdParamSchema = z.object({
  id: z.string().uuid('Invalid assessment ID format')
});

export const ScaleIdParamSchema = z.object({
  id: z.string().min(1, 'Scale ID is required')
});

// Export type inference helpers
export type AssessmentScale = z.infer<typeof AssessmentScaleSchema>;
export type AssessmentQuestion = z.infer<typeof AssessmentQuestionSchema>;
export type AssessmentResponse = z.infer<typeof AssessmentResponseSchema>;
export type PreAssessment = z.infer<typeof PreAssessmentSchema>;
export type CreatePreAssessmentDto = z.infer<typeof CreatePreAssessmentDtoSchema>;
export type UpdatePreAssessmentDto = z.infer<typeof UpdatePreAssessmentDtoSchema>;
export type AssessmentResult = z.infer<typeof AssessmentResultSchema>;
export type AssessmentAnalytics = z.infer<typeof AssessmentAnalyticsSchema>;
export type AssessmentQuery = z.infer<typeof AssessmentQuerySchema>;
export type ProcessAssessmentDto = z.infer<typeof ProcessAssessmentDtoSchema>;
export type ExportAssessmentDto = z.infer<typeof ExportAssessmentDtoSchema>;
export type CrisisAssessmentDto = z.infer<typeof CrisisAssessmentDtoSchema>;
export type AssessmentIdParam = z.infer<typeof AssessmentIdParamSchema>;
export type ScaleIdParam = z.infer<typeof ScaleIdParamSchema>;