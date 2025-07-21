import { z } from 'zod';
export declare const AssessmentScaleSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    questionCount: z.ZodNumber;
    minScore: z.ZodNumber;
    maxScore: z.ZodNumber;
    categories: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    description: string;
    questionCount: number;
    minScore: number;
    maxScore: number;
    categories: string[];
}, {
    id: string;
    name: string;
    description: string;
    questionCount: number;
    minScore: number;
    maxScore: number;
    categories: string[];
}>;
export declare const AssessmentQuestionSchema: z.ZodObject<{
    id: z.ZodString;
    scaleId: z.ZodString;
    text: z.ZodString;
    type: z.ZodEnum<["likert", "yes_no", "multiple_choice", "text"]>;
    options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    order: z.ZodNumber;
    isRequired: z.ZodBoolean;
    category: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "text" | "likert" | "yes_no" | "multiple_choice";
    text: string;
    order: number;
    isRequired: boolean;
    scaleId: string;
    options?: string[] | undefined;
    category?: string | undefined;
}, {
    id: string;
    type: "text" | "likert" | "yes_no" | "multiple_choice";
    text: string;
    order: number;
    isRequired: boolean;
    scaleId: string;
    options?: string[] | undefined;
    category?: string | undefined;
}>;
export declare const AssessmentResponseSchema: z.ZodObject<{
    questionId: z.ZodString;
    value: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    textValue: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    value: string | number;
    questionId: string;
    textValue?: string | undefined;
}, {
    value: string | number;
    questionId: string;
    textValue?: string | undefined;
}>;
export declare const PreAssessmentSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    responses: z.ZodArray<z.ZodObject<{
        questionId: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        textValue: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: string | number;
        questionId: string;
        textValue?: string | undefined;
    }, {
        value: string | number;
        questionId: string;
        textValue?: string | undefined;
    }>, "many">;
    scores: z.ZodRecord<z.ZodString, z.ZodNumber>;
    overallScore: z.ZodNumber;
    recommendations: z.ZodArray<z.ZodString, "many">;
    riskLevel: z.ZodEnum<["low", "moderate", "high", "critical"]>;
    completedAt: z.ZodString;
    processedAt: z.ZodOptional<z.ZodString>;
    isProcessed: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: string;
    userId: string;
    completedAt: string;
    responses: {
        value: string | number;
        questionId: string;
        textValue?: string | undefined;
    }[];
    scores: Record<string, number>;
    overallScore: number;
    recommendations: string[];
    riskLevel: "low" | "high" | "moderate" | "critical";
    isProcessed: boolean;
    processedAt?: string | undefined;
}, {
    id: string;
    userId: string;
    completedAt: string;
    responses: {
        value: string | number;
        questionId: string;
        textValue?: string | undefined;
    }[];
    scores: Record<string, number>;
    overallScore: number;
    recommendations: string[];
    riskLevel: "low" | "high" | "moderate" | "critical";
    isProcessed: boolean;
    processedAt?: string | undefined;
}>;
export declare const CreatePreAssessmentDtoSchema: z.ZodObject<{
    userId: z.ZodString;
    questionnaires: z.ZodArray<z.ZodString, "many">;
    answers: z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">;
    answerMatrix: z.ZodArray<z.ZodNumber, "many">;
    scores: z.ZodRecord<z.ZodString, z.ZodNumber>;
    severityLevels: z.ZodRecord<z.ZodString, z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    scores: Record<string, number>;
    questionnaires: string[];
    answers: number[][];
    answerMatrix: number[];
    severityLevels: Record<string, string>;
    metadata?: Record<string, any> | undefined;
}, {
    userId: string;
    scores: Record<string, number>;
    questionnaires: string[];
    answers: number[][];
    answerMatrix: number[];
    severityLevels: Record<string, string>;
    metadata?: Record<string, any> | undefined;
}>;
export declare const UpdatePreAssessmentDtoSchema: z.ZodObject<{
    questionnaires: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    answers: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">>;
    answerMatrix: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    scores: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    severityLevels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    scores?: Record<string, number> | undefined;
    questionnaires?: string[] | undefined;
    answers?: number[][] | undefined;
    answerMatrix?: number[] | undefined;
    severityLevels?: Record<string, string> | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    scores?: Record<string, number> | undefined;
    questionnaires?: string[] | undefined;
    answers?: number[][] | undefined;
    answerMatrix?: number[] | undefined;
    severityLevels?: Record<string, string> | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export declare const AssessmentResultSchema: z.ZodObject<{
    scales: z.ZodRecord<z.ZodString, z.ZodObject<{
        score: z.ZodNumber;
        percentile: z.ZodNumber;
        category: z.ZodString;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description: string;
        category: string;
        score: number;
        percentile: number;
    }, {
        description: string;
        category: string;
        score: number;
        percentile: number;
    }>>;
    overallAssessment: z.ZodObject<{
        riskLevel: z.ZodEnum<["low", "moderate", "high", "critical"]>;
        summary: z.ZodString;
        recommendations: z.ZodArray<z.ZodString, "many">;
        urgentCare: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        recommendations: string[];
        riskLevel: "low" | "high" | "moderate" | "critical";
        summary: string;
        urgentCare: boolean;
    }, {
        recommendations: string[];
        riskLevel: "low" | "high" | "moderate" | "critical";
        summary: string;
        urgentCare: boolean;
    }>;
    therapeuticRecommendations: z.ZodObject<{
        recommendedTherapyTypes: z.ZodArray<z.ZodString, "many">;
        recommendedSpecialties: z.ZodArray<z.ZodString, "many">;
        sessionFrequency: z.ZodString;
        priorityAreas: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        recommendedTherapyTypes: string[];
        recommendedSpecialties: string[];
        sessionFrequency: string;
        priorityAreas: string[];
    }, {
        recommendedTherapyTypes: string[];
        recommendedSpecialties: string[];
        sessionFrequency: string;
        priorityAreas: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    scales: Record<string, {
        description: string;
        category: string;
        score: number;
        percentile: number;
    }>;
    overallAssessment: {
        recommendations: string[];
        riskLevel: "low" | "high" | "moderate" | "critical";
        summary: string;
        urgentCare: boolean;
    };
    therapeuticRecommendations: {
        recommendedTherapyTypes: string[];
        recommendedSpecialties: string[];
        sessionFrequency: string;
        priorityAreas: string[];
    };
}, {
    scales: Record<string, {
        description: string;
        category: string;
        score: number;
        percentile: number;
    }>;
    overallAssessment: {
        recommendations: string[];
        riskLevel: "low" | "high" | "moderate" | "critical";
        summary: string;
        urgentCare: boolean;
    };
    therapeuticRecommendations: {
        recommendedTherapyTypes: string[];
        recommendedSpecialties: string[];
        sessionFrequency: string;
        priorityAreas: string[];
    };
}>;
export declare const AssessmentAnalyticsSchema: z.ZodObject<{
    totalAssessments: z.ZodNumber;
    averageScore: z.ZodNumber;
    riskDistribution: z.ZodRecord<z.ZodString, z.ZodNumber>;
    completionRate: z.ZodNumber;
    averageCompletionTime: z.ZodNumber;
    mostCommonRecommendations: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    completionRate: number;
    totalAssessments: number;
    averageScore: number;
    riskDistribution: Record<string, number>;
    averageCompletionTime: number;
    mostCommonRecommendations: string[];
}, {
    completionRate: number;
    totalAssessments: number;
    averageScore: number;
    riskDistribution: Record<string, number>;
    averageCompletionTime: number;
    mostCommonRecommendations: string[];
}>;
export declare const AssessmentQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    userId: z.ZodOptional<z.ZodString>;
    riskLevel: z.ZodOptional<z.ZodEnum<["low", "moderate", "high", "critical"]>>;
    isProcessed: z.ZodOptional<z.ZodBoolean>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodEnum<["completedAt", "overallScore", "riskLevel"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    userId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "completedAt" | "overallScore" | "riskLevel" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    riskLevel?: "low" | "high" | "moderate" | "critical" | undefined;
    isProcessed?: boolean | undefined;
}, {
    userId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "completedAt" | "overallScore" | "riskLevel" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    riskLevel?: "low" | "high" | "moderate" | "critical" | undefined;
    isProcessed?: boolean | undefined;
}>;
export declare const ProcessAssessmentDtoSchema: z.ZodObject<{
    assessmentId: z.ZodString;
    forceReprocess: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    assessmentId: string;
    forceReprocess: boolean;
}, {
    assessmentId: string;
    forceReprocess?: boolean | undefined;
}>;
export declare const ExportAssessmentDtoSchema: z.ZodObject<{
    assessmentIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    format: z.ZodDefault<z.ZodEnum<["json", "csv", "pdf"]>>;
    includePersonalInfo: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    format: "csv" | "json" | "pdf";
    includePersonalInfo: boolean;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    assessmentIds?: string[] | undefined;
}, {
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    format?: "csv" | "json" | "pdf" | undefined;
    assessmentIds?: string[] | undefined;
    includePersonalInfo?: boolean | undefined;
}>;
export declare const CrisisAssessmentDtoSchema: z.ZodObject<{
    userId: z.ZodString;
    severity: z.ZodEnum<["low", "moderate", "high", "critical"]>;
    symptoms: z.ZodArray<z.ZodString, "many">;
    immediateRisk: z.ZodBoolean;
    supportNeeded: z.ZodBoolean;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    severity: "low" | "high" | "moderate" | "critical";
    symptoms: string[];
    immediateRisk: boolean;
    supportNeeded: boolean;
    notes?: string | undefined;
}, {
    userId: string;
    severity: "low" | "high" | "moderate" | "critical";
    symptoms: string[];
    immediateRisk: boolean;
    supportNeeded: boolean;
    notes?: string | undefined;
}>;
export declare const AssessmentIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const ScaleIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const PreAssessmentListParamsSchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodString>;
    isProcessed: z.ZodOptional<z.ZodBoolean>;
    overallRisk: z.ZodOptional<z.ZodEnum<["low", "moderate", "high", "critical"]>>;
    processedAfter: z.ZodOptional<z.ZodString>;
    processedBefore: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["completedAt", "processedAt", "overallScore", "riskLevel"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    sortBy: "completedAt" | "processedAt" | "overallScore" | "riskLevel";
    sortOrder: "asc" | "desc";
    offset: number;
    userId?: string | undefined;
    isProcessed?: boolean | undefined;
    overallRisk?: "low" | "high" | "moderate" | "critical" | undefined;
    processedAfter?: string | undefined;
    processedBefore?: string | undefined;
}, {
    userId?: string | undefined;
    limit?: number | undefined;
    sortBy?: "completedAt" | "processedAt" | "overallScore" | "riskLevel" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    offset?: number | undefined;
    isProcessed?: boolean | undefined;
    overallRisk?: "low" | "high" | "moderate" | "critical" | undefined;
    processedAfter?: string | undefined;
    processedBefore?: string | undefined;
}>;
export declare const PreAssessmentListResponseSchema: z.ZodObject<{
    assessments: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        responses: z.ZodArray<z.ZodObject<{
            questionId: z.ZodString;
            value: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
            textValue: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: string | number;
            questionId: string;
            textValue?: string | undefined;
        }, {
            value: string | number;
            questionId: string;
            textValue?: string | undefined;
        }>, "many">;
        scores: z.ZodRecord<z.ZodString, z.ZodNumber>;
        overallScore: z.ZodNumber;
        recommendations: z.ZodArray<z.ZodString, "many">;
        riskLevel: z.ZodEnum<["low", "moderate", "high", "critical"]>;
        completedAt: z.ZodString;
        processedAt: z.ZodOptional<z.ZodString>;
        isProcessed: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        id: string;
        userId: string;
        completedAt: string;
        responses: {
            value: string | number;
            questionId: string;
            textValue?: string | undefined;
        }[];
        scores: Record<string, number>;
        overallScore: number;
        recommendations: string[];
        riskLevel: "low" | "high" | "moderate" | "critical";
        isProcessed: boolean;
        processedAt?: string | undefined;
    }, {
        id: string;
        userId: string;
        completedAt: string;
        responses: {
            value: string | number;
            questionId: string;
            textValue?: string | undefined;
        }[];
        scores: Record<string, number>;
        overallScore: number;
        recommendations: string[];
        riskLevel: "low" | "high" | "moderate" | "critical";
        isProcessed: boolean;
        processedAt?: string | undefined;
    }>, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    limit: z.ZodNumber;
    hasMore: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    hasMore: boolean;
    total: number;
    assessments: {
        id: string;
        userId: string;
        completedAt: string;
        responses: {
            value: string | number;
            questionId: string;
            textValue?: string | undefined;
        }[];
        scores: Record<string, number>;
        overallScore: number;
        recommendations: string[];
        riskLevel: "low" | "high" | "moderate" | "critical";
        isProcessed: boolean;
        processedAt?: string | undefined;
    }[];
}, {
    page: number;
    limit: number;
    hasMore: boolean;
    total: number;
    assessments: {
        id: string;
        userId: string;
        completedAt: string;
        responses: {
            value: string | number;
            questionId: string;
            textValue?: string | undefined;
        }[];
        scores: Record<string, number>;
        overallScore: number;
        recommendations: string[];
        riskLevel: "low" | "high" | "moderate" | "critical";
        isProcessed: boolean;
        processedAt?: string | undefined;
    }[];
}>;
export declare const AIServiceHealthResponseSchema: z.ZodObject<{
    status: z.ZodEnum<["healthy", "degraded", "unhealthy"]>;
    uptime: z.ZodNumber;
    responseTime: z.ZodNumber;
    processedToday: z.ZodNumber;
    queueLength: z.ZodNumber;
    lastProcessedAt: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "healthy" | "degraded" | "unhealthy";
    uptime: number;
    responseTime: number;
    processedToday: number;
    queueLength: number;
    message?: string | undefined;
    lastProcessedAt?: string | undefined;
    version?: string | undefined;
}, {
    status: "healthy" | "degraded" | "unhealthy";
    uptime: number;
    responseTime: number;
    processedToday: number;
    queueLength: number;
    message?: string | undefined;
    lastProcessedAt?: string | undefined;
    version?: string | undefined;
}>;
export declare const ReprocessRequestSchema: z.ZodObject<{
    forceReprocess: z.ZodDefault<z.ZodBoolean>;
    updateScores: z.ZodDefault<z.ZodBoolean>;
    recalculateRecommendations: z.ZodDefault<z.ZodBoolean>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    forceReprocess: boolean;
    updateScores: boolean;
    recalculateRecommendations: boolean;
    reason?: string | undefined;
}, {
    reason?: string | undefined;
    forceReprocess?: boolean | undefined;
    updateScores?: boolean | undefined;
    recalculateRecommendations?: boolean | undefined;
}>;
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
export type PreAssessmentListParams = z.infer<typeof PreAssessmentListParamsSchema>;
export type PreAssessmentListResponse = z.infer<typeof PreAssessmentListResponseSchema>;
export type AIServiceHealthResponse = z.infer<typeof AIServiceHealthResponseSchema>;
export type ReprocessRequest = z.infer<typeof ReprocessRequestSchema>;
//# sourceMappingURL=pre-assessment.d.ts.map