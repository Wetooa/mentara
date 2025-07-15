"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScaleIdParamSchema = exports.AssessmentIdParamSchema = exports.CrisisAssessmentDtoSchema = exports.ExportAssessmentDtoSchema = exports.ProcessAssessmentDtoSchema = exports.AssessmentQuerySchema = exports.AssessmentAnalyticsSchema = exports.AssessmentResultSchema = exports.UpdatePreAssessmentDtoSchema = exports.CreatePreAssessmentDtoSchema = exports.PreAssessmentSchema = exports.AssessmentResponseSchema = exports.AssessmentQuestionSchema = exports.AssessmentScaleSchema = void 0;
const zod_1 = require("zod");
// Assessment Scale Schema
exports.AssessmentScaleSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    questionCount: zod_1.z.number(),
    minScore: zod_1.z.number(),
    maxScore: zod_1.z.number(),
    categories: zod_1.z.array(zod_1.z.string())
});
// Assessment Question Schema
exports.AssessmentQuestionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    scaleId: zod_1.z.string(),
    text: zod_1.z.string(),
    type: zod_1.z.enum(['likert', 'yes_no', 'multiple_choice', 'text']),
    options: zod_1.z.array(zod_1.z.string()).optional(),
    order: zod_1.z.number(),
    isRequired: zod_1.z.boolean(),
    category: zod_1.z.string().optional()
});
// Assessment Response Schema
exports.AssessmentResponseSchema = zod_1.z.object({
    questionId: zod_1.z.string(),
    value: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
    textValue: zod_1.z.string().optional()
});
// Pre-Assessment Schema
exports.PreAssessmentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    responses: zod_1.z.array(exports.AssessmentResponseSchema),
    scores: zod_1.z.record(zod_1.z.number()),
    overallScore: zod_1.z.number(),
    recommendations: zod_1.z.array(zod_1.z.string()),
    riskLevel: zod_1.z.enum(['low', 'moderate', 'high', 'critical']),
    completedAt: zod_1.z.string().datetime(),
    processedAt: zod_1.z.string().datetime().optional(),
    isProcessed: zod_1.z.boolean()
});
// Create Pre-Assessment Schema (updated from class-validator DTO)
exports.CreatePreAssessmentDtoSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID format'),
    questionnaires: zod_1.z.array(zod_1.z.string()).min(1, 'At least one questionnaire is required'),
    answers: zod_1.z.array(zod_1.z.array(zod_1.z.number())).min(1, 'At least one answer set is required'),
    answerMatrix: zod_1.z.array(zod_1.z.number()).min(1, 'Answer matrix is required'),
    scores: zod_1.z.record(zod_1.z.number()),
    severityLevels: zod_1.z.record(zod_1.z.string()),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
// Update Pre-Assessment Schema (updated from class-validator DTO)
exports.UpdatePreAssessmentDtoSchema = zod_1.z.object({
    questionnaires: zod_1.z.array(zod_1.z.string()).optional(),
    answers: zod_1.z.array(zod_1.z.array(zod_1.z.number())).optional(),
    answerMatrix: zod_1.z.array(zod_1.z.number()).optional(),
    scores: zod_1.z.record(zod_1.z.number()).optional(),
    severityLevels: zod_1.z.record(zod_1.z.string()).optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
// Assessment Result Schema
exports.AssessmentResultSchema = zod_1.z.object({
    scales: zod_1.z.record(zod_1.z.object({
        score: zod_1.z.number(),
        percentile: zod_1.z.number(),
        category: zod_1.z.string(),
        description: zod_1.z.string()
    })),
    overallAssessment: zod_1.z.object({
        riskLevel: zod_1.z.enum(['low', 'moderate', 'high', 'critical']),
        summary: zod_1.z.string(),
        recommendations: zod_1.z.array(zod_1.z.string()),
        urgentCare: zod_1.z.boolean()
    }),
    therapeuticRecommendations: zod_1.z.object({
        recommendedTherapyTypes: zod_1.z.array(zod_1.z.string()),
        recommendedSpecialties: zod_1.z.array(zod_1.z.string()),
        sessionFrequency: zod_1.z.string(),
        priorityAreas: zod_1.z.array(zod_1.z.string())
    })
});
// Assessment Analytics Schema
exports.AssessmentAnalyticsSchema = zod_1.z.object({
    totalAssessments: zod_1.z.number(),
    averageScore: zod_1.z.number(),
    riskDistribution: zod_1.z.record(zod_1.z.number()),
    completionRate: zod_1.z.number(),
    averageCompletionTime: zod_1.z.number(),
    mostCommonRecommendations: zod_1.z.array(zod_1.z.string())
});
// Assessment Query Parameters
exports.AssessmentQuerySchema = zod_1.z.object({
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    userId: zod_1.z.string().uuid().optional(),
    riskLevel: zod_1.z.enum(['low', 'moderate', 'high', 'critical']).optional(),
    isProcessed: zod_1.z.boolean().optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    sortBy: zod_1.z.enum(['completedAt', 'overallScore', 'riskLevel']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional()
});
// Assessment Process Request Schema
exports.ProcessAssessmentDtoSchema = zod_1.z.object({
    assessmentId: zod_1.z.string().uuid('Invalid assessment ID format'),
    forceReprocess: zod_1.z.boolean().default(false)
});
// Assessment Export Schema
exports.ExportAssessmentDtoSchema = zod_1.z.object({
    assessmentIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    format: zod_1.z.enum(['json', 'csv', 'pdf']).default('json'),
    includePersonalInfo: zod_1.z.boolean().default(false)
});
// Crisis Assessment Schema
exports.CrisisAssessmentDtoSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID format'),
    severity: zod_1.z.enum(['low', 'moderate', 'high', 'critical']),
    symptoms: zod_1.z.array(zod_1.z.string()),
    immediateRisk: zod_1.z.boolean(),
    supportNeeded: zod_1.z.boolean(),
    notes: zod_1.z.string().max(2000, 'Notes too long').optional()
});
// Parameter Schemas
exports.AssessmentIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid assessment ID format')
});
exports.ScaleIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Scale ID is required')
});
//# sourceMappingURL=pre-assessment.js.map