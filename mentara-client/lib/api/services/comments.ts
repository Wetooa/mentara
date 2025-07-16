import { AxiosInstance } from 'axios';
import {
  CommentCreateInputDto,
  CommentUpdateInputDto,
  Comment,
  CommentQuery,
  CommentIdParam,
  CommentParamsDto,
  CommentPostParamsDto,
  CreateCommentDto,
  UpdateCommentDto,
  CreateReactionDto,
  ReportCommentDto,
  CommentReaction,
} from '@mentara/commons';

// Extended interfaces for UI-specific data structures
export interface CommentListParams {
  postId?: string;
  authorId?: string;
  parentId?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
}

export interface CommentListResponse {
  comments: CommentWithDetails[];
  total: number;
  hasMore: boolean;
}

export interface CommentWithDetails extends Comment {
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  reactions: CommentReaction[];
  reactionCount: number;
  isReacted?: boolean;
  replies?: CommentWithDetails[];
  replyCount: number;
}

export interface HeartCommentResponse {
  isHearted: boolean;
  heartCount: number;
}

export interface CreateReplyRequest {
  content: string;
  parentId: string;
}

export interface CommentsService {
  getAll(params?: CommentListParams): Promise<CommentListResponse>;
  getById(id: string): Promise<CommentWithDetails>;
  create(data: CommentCreateInputDto): Promise<CommentWithDetails>;
  update(id: string, data: CommentUpdateInputDto): Promise<CommentWithDetails>;
  delete(id: string): Promise<void>;
  
  // Reply functionality
  createReply(data: CreateReplyRequest): Promise<CommentWithDetails>;
  
  // Heart/Like functionality
  heart(id: string): Promise<HeartCommentResponse>;
  unheart(id: string): Promise<HeartCommentResponse>;
}

export const createCommentsService = (client: AxiosInstance): CommentsService => ({
  getAll: (params: CommentListParams = {}): Promise<CommentListResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.postId) searchParams.append('postId', params.postId);
    if (params.authorId) searchParams.append('authorId', params.authorId);
    if (params.parentId) searchParams.append('parentId', params.parentId);
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);

    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return client.get(`/comments${queryString}`);
  },

  getById: (id: string): Promise<CommentWithDetails> =>
    client.get(`/comments/${id}`),

  create: (data: CommentCreateInputDto): Promise<CommentWithDetails> =>
    client.post('/comments', data),

  update: (id: string, data: CommentUpdateInputDto): Promise<CommentWithDetails> =>
    client.put(`/comments/${id}`, data),

  delete: (id: string): Promise<void> =>
    client.delete(`/comments/${id}`),

  // Reply functionality
  createReply: (data: CreateReplyRequest): Promise<CommentWithDetails> =>
    client.post('/comments', {
      content: data.content,
      postId: '', // Will be inferred from parent comment
      parentId: data.parentId,
    }),

  // Heart/Like functionality
  heart: (id: string): Promise<HeartCommentResponse> =>
    client.post(`/comments/${id}/heart`),

  unheart: (id: string): Promise<HeartCommentResponse> =>
    client.delete(`/comments/${id}/heart`),
});