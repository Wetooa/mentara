/**
 * Comments Module DTOs - Data Transfer Objects for comment operations
 * These are pure TypeScript interfaces without validation logic
 */

// Comment creation DTO
export interface CommentCreateInputDto {
  content: string;
  postId: string;
  parentCommentId?: string; // For nested/reply comments
  parentId?: string; // Alternative property name for parentCommentId
  attachments?: string[];
  isAnonymous?: boolean;
  metadata?: {
    mood?: string;
    supportType?: 'encouragement' | 'advice' | 'sharing' | 'question';
  };
}

// Comment update DTO
export interface CommentUpdateInputDto {
  content?: string;
  attachments?: string[];
  isAnonymous?: boolean;
  isActive?: boolean;
  metadata?: {
    mood?: string;
    supportType?: 'encouragement' | 'advice' | 'sharing' | 'question';
  };
}

// Comment response DTO
export interface CommentResponseDto {
  id: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    isAnonymous?: boolean;
  };
  postId: string;
  parentCommentId?: string;
  attachments: string[];
  likesCount: number;
  repliesCount: number;
  isLikedByUser?: boolean;
  isActive: boolean;
  depth: number; // For nested comment display
  createdAt: string;
  updatedAt: string;
  replies?: CommentResponseDto[]; // Nested replies
  metadata?: {
    mood?: string;
    supportType?: 'encouragement' | 'advice' | 'sharing' | 'question';
  };
}

// Comment query DTO
export interface CommentQueryDto {
  postId?: string;
  authorId?: string;
  parentCommentId?: string;
  sortBy?: 'recent' | 'popular' | 'oldest';
  limit?: number;
  offset?: number;
  includeReplies?: boolean;
  maxDepth?: number; // For controlling nested comment depth
}

// Comment interaction DTO
export interface CommentInteractionDto {
  action: 'like' | 'unlike' | 'report';
  reason?: string;
}