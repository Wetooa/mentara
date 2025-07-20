import { Therapist, User } from '@prisma/client';

// Extend Express Request interface to include auth properties
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
      user?: User | undefined;
    }
  }
}

export interface CommunityStats {
  totalMembers: number;
  totalPosts: number;
  activeCommunities: number;
  illnessCommunities: {
    illness: string;
    communityCount: number;
    memberCount: number;
  }[];
}

// Therapist with User relationship type
export type TherapistWithUser = Therapist & {
  user: User;
  matchScore?: number;
};

// Query parameters
export interface FilterQuery {
  userId?: string;
  therapistId?: string;
  communityId?: string;
  postId?: string;
  type?: string;
  difficulty?: string;
  status?: string;
}

// Therapist Specialization Types
export interface TherapistSpecialization {
  illness: string;
  expertiseLevel: number; // 1-5 scale
  successRate?: number; // 0-100 percentage
}

// Therapist Recommendation Types
export interface TherapistRecommendationRequest {
  userId: string;
  limit?: number;
  includeInactive?: boolean;
  province?: string;
  maxHourlyRate?: number;
}

// Worksheet types
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Pre-assessment types
export interface PreAssessmentAnswersData {
  questionnaires: string[];
  rawAnswers: number[][];
  answerMatrix?: number[][];
  scores: Record<string, number>;
  severityLevels: Record<string, string>;
  aiEstimate?: Record<string, boolean>;
}

export interface PreAssessmentResponse {
  id: string;
  clientId: string;
  answers: PreAssessmentAnswersData;
  createdAt: Date;
  updatedAt: Date;
}
