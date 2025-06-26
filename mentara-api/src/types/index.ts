import { Post, Comment, Prisma } from '@prisma/client';

// Prisma types for relations
export type ClientWithUser = Prisma.ClientGetPayload<{
  include: { user: true };
}>;
export type TherapistWithUser = Prisma.TherapistGetPayload<{
  include: { user: true };
}>;
export type ModeratorWithUser = Prisma.ModeratorGetPayload<{
  include: { user: true };
}>;
export type AdminWithUser = Prisma.AdminGetPayload<{
  include: { user: true };
}>;
export type CommunityWithMembers = Prisma.CommunityGetPayload<{
  include: { memberships: { include: { user: true } } };
}>;
export type PostResponse = Post;
export type CommentResponse = Comment;
export type PostWithUserAndComments = Prisma.PostGetPayload<{
  include: {
    user: true;
    comments: {
      include: {
        user: true;
        replies: { include: { user: true } };
        files: true;
        hearts: true;
        _count: true;
      };
    };
    files: true;
    hearts: true;
    _count: true;
  };
}>;
export type CommentWithUserAndReplies = Prisma.CommentGetPayload<{
  include: {
    user: true;
    replies: { include: { user: true } };
    files: true;
    hearts: true;
  };
}>;

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

export interface TherapistRecommendationResponse {
  totalCount: number;
  userConditions: string[];
  therapists: (TherapistWithUser & { matchScore?: number })[];
  matchCriteria: {
    primaryConditions: string[];
    secondaryConditions: string[];
    severityLevels: Record<string, string>;
  };
  page?: number;
  pageSize?: number;
}

// Worksheet types
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

// Re-export worksheet DTOs for easy importing
export {
  CreateWorksheetDto,
  UpdateWorksheetDto,
  CreateSubmissionDto,
  SubmitWorksheetDto,
  CreateWorksheetMaterialDto,
} from '../worksheets/dto/worksheet.dto';
