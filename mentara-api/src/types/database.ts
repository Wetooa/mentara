import { User, Therapist, Client, Admin, Moderator } from '@prisma/client';

/**
 * Database-related types and extended Prisma types
 */

// Extended User types with relationships
type UserWithProfile = User & {
  client?: Client;
  therapist?: Therapist;
  admin?: Admin;
  moderator?: Moderator;
};

// Therapist with User relationship
type TherapistWithUser = Therapist & {
  user: User;
  matchScore?: number;
};

// Client with User relationship  
type ClientWithUser = Client & {
  user: User;
};

// Admin with User relationship
type AdminWithUser = Admin & {
  user: User;
};

// Moderator with User relationship
type ModeratorWithUser = Moderator & {
  user: User;
};

// Community statistics
interface CommunityStats {
  totalMembers: number;
  totalPosts: number;
  activeCommunities: number;
  illnessCommunities: {
    illness: string;
    communityCount: number;
    memberCount: number;
  }[];
}

// Therapist specialization types
interface TherapistSpecialization {
  illness: string;
  expertiseLevel: number; // 1-5 scale
  successRate?: number; // 0-100 percentage
}

// Pre-assessment types
interface PreAssessmentAnswersData {
  questionnaires: string[];
  rawAnswers: number[][];
  answerMatrix?: number[][];
  scores: Record<string, number>;
  severityLevels: Record<string, string>;
  aiEstimate?: Record<string, boolean>;
}

interface PreAssessmentResponse {
  id: string;
  clientId: string;
  answers: PreAssessmentAnswersData;
  createdAt: Date;
  updatedAt: Date;
}