// Pre-assessment DTOs matching backend exactly

export interface CreatePreAssessmentDto {
  answers: number[]; // Flat array of exactly 201 numeric responses
  scores?: Record<string, number>;
  severityLevels?: Record<string, string>;
}

export interface PreAssessment {
  id: string;
  clientId: string;
  answers: number[]; // Flat array of 201 numeric responses
  scores: Record<string, number>;
  severityLevels: Record<string, string>;
  aiEstimate: Record<string, boolean>;
  isProcessed: boolean;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  client?: {
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
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
    expertise: string[];
    illnessSpecializations: string[];
    areasOfExpertise: string[];
  };
  processedAt: string;
}

export interface UpdatePreAssessmentDto {
  answers?: number[]; // Flat array of exactly 201 numeric responses
  scores?: Record<string, number>;
  severityLevels?: Record<string, string>;
  aiEstimate?: Record<string, boolean>;
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