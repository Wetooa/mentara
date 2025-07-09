// Pre-assessment DTOs matching backend exactly

export interface CreatePreAssessmentDto {
  answerMatrix: number[][]; // 201-item questionnaire responses
  metadata?: {
    source?: string;
    sessionId?: string;
    startedAt?: string;
    completedAt?: string;
    [key: string]: any;
  };
}

export interface PreAssessment {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  answerMatrix: number[][];
  metadata: Record<string, any>;
  aiAnalysisResult?: PreAssessmentAnalysis;
  isProcessed: boolean;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PreAssessmentAnalysis {
  scaleScores: {
    [scaleName: string]: {
      rawScore: number;
      percentile: number;
      severity: 'minimal' | 'mild' | 'moderate' | 'severe' | 'extreme';
      interpretation: string;
    };
  };
  overallRisk: 'low' | 'moderate' | 'high' | 'critical';
  recommendations: string[];
  suggestedCommunities: string[];
  therapistMatch?: {
    specialties: string[];
    urgency: 'routine' | 'priority' | 'urgent';
  };
  processedAt: string;
}

export interface UpdatePreAssessmentDto {
  answerMatrix?: number[][];
  metadata?: Record<string, any>;
}

export interface PreAssessmentListParams {
  userId?: string;
  isProcessed?: boolean;
  overallRisk?: 'low' | 'moderate' | 'high' | 'critical';
  processedAfter?: string;
  processedBefore?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'processedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PreAssessmentListResponse {
  assessments: PreAssessment[];
  total: number;
  hasMore: boolean;
}

export interface AIServiceHealthResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  version: string;
  uptime: number;
  lastProcessed?: string;
  queueSize?: number;
}

export interface ReprocessRequest {
  force?: boolean;
}