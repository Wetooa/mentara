// Import DTOs from @mentara/commons for consistency
export type {
  CommentCreateInputDto,
  CommentUpdateInputDto,
  Comment as CommonComment,
  CommentHeart as CommonCommentHeart,
  HeartToggleResponse,
} from '@mentara/commons';

// Extended Comment interface with UI-specific fields
export interface Comment {
  id: string;
  content: string;
  postId: string;
  userId: string; // Updated from authorId to match backend
  parentId?: string;
  post?: {
    id: string;
    title: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    role?: 'client' | 'therapist' | 'moderator' | 'admin';
  };
  parent?: Comment;
  children?: Comment[]; // Unified nested comments (replaces replies)
  childrenCount: number; // Renamed from replyCount
  hearts: CommentHeart[];
  heartCount: number;
  isHearted?: boolean;
  createdAt: string;
  updatedAt: string;
  // File attachments support
  attachmentUrls?: string[];
  attachmentNames?: string[];
  attachmentSizes?: number[];
}

export interface CommentHeart {
  id: string;
  commentId: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
  createdAt: string;
}

export interface CommentListParams {
  postId?: string;
  userId?: string; // Updated from authorId to match backend
  parentId?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'best' | 'new' | 'old' | 'hearts'; // Updated sort options
}

export interface CommentListResponse {
  comments: Comment[];
  total: number;
  hasMore: boolean;
}

// Use HeartToggleResponse from @mentara/commons instead
// CreateReplyRequest removed - use CommentCreateInputDto with parentId instead