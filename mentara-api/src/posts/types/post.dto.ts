/**
 * Posts Module DTOs - Data Transfer Objects for post operations
 * These are pure TypeScript interfaces without validation logic
 */

// Post creation DTO
export interface PostCreateInputDto {
  title: string;
  content: string;
  communityId: string;
  roomId?: string; // Support for room-based posts (same as communityId)
  tags?: string[];
  attachments?: string[];
  isAnonymous?: boolean;
  isPinned?: boolean;
  allowComments?: boolean;
  metadata?: {
    category?: string;
    mood?: string;
    triggerWarning?: boolean;
    triggerWarningText?: string;
  };
}

// Post update DTO
export interface PostUpdateInputDto {
  title?: string;
  content?: string;
  tags?: string[];
  attachments?: string[];
  isAnonymous?: boolean;
  isPinned?: boolean;
  allowComments?: boolean;
  isActive?: boolean;
  metadata?: {
    category?: string;
    mood?: string;
    triggerWarning?: boolean;
    triggerWarningText?: string;
  };
}

// Post response DTO
export interface PostResponseDto {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    isAnonymous?: boolean;
  };
  communityId: string;
  community?: {
    id: string;
    name: string;
    slug: string;
  };
  tags: string[];
  attachments: string[];
  likesCount: number;
  commentsCount: number;
  isLikedByUser?: boolean;
  isPinned: boolean;
  allowComments: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    category?: string;
    mood?: string;
    triggerWarning?: boolean;
    triggerWarningText?: string;
  };
}

// Post query DTO
export interface PostQueryDto {
  communityId?: string;
  authorId?: string;
  tags?: string[];
  category?: string;
  sortBy?: 'recent' | 'popular' | 'trending' | 'oldest';
  limit?: number;
  offset?: number;
  includePinned?: boolean;
  onlyPinned?: boolean;
  search?: string;
}

// Post interaction DTO
export interface PostInteractionDto {
  action: 'like' | 'unlike' | 'bookmark' | 'unbookmark' | 'report';
  reason?: string;
}