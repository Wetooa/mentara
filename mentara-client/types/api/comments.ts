// Comments DTOs matching backend exactly

export interface CommentCreateInputDto {
  content: string;
  postId: string;
  parentId?: string; // for replies
}

export interface CommentUpdateInputDto {
  content?: string;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  post: {
    id: string;
    title: string;
  };
  authorId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
  parentId?: string;
  parent?: Comment;
  replies: Comment[];
  replyCount: number;
  hearts: CommentHeart[];
  heartCount: number;
  isHearted?: boolean; // for current user
  createdAt: string;
  updatedAt: string;
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
  authorId?: string;
  parentId?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'newest' | 'oldest' | 'popular';
}

export interface CommentListResponse {
  comments: Comment[];
  total: number;
  hasMore: boolean;
}

export interface HeartCommentResponse {
  isHearted: boolean;
  heartCount: number;
}

export interface CreateReplyRequest {
  content: string;
  parentId: string;
}