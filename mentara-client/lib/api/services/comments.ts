import { AxiosInstance } from 'axios';
import {
  CommentCreateInputDto,
  CommentUpdateInputDto,
  Comment,
  CommentHeart,
  HeartToggleResponse,
} from '@mentara/commons';

// Extended interfaces for UI-specific data structures
export interface CommentListParams {
  postId?: string;
  userId?: string; // Changed from authorId to match backend
  parentId?: string; // For fetching nested comments
  limit?: number;
  offset?: number;
  sortBy?: 'best' | 'new' | 'old' | 'hearts'; // Updated sort options
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
    role?: 'client' | 'therapist' | 'moderator' | 'admin';
  };
  hearts: CommentHeart[];
  heartCount: number;
  isHearted?: boolean;
  children?: CommentWithDetails[]; // Unified nested comments via parentId
  childrenCount: number;
}

// Report functionality
export interface ReportSubmission {
  reason: string;
  content?: string;
}

export interface ReportResponse {
  success: boolean;
  reportId: string;
}

// Use HeartToggleResponse from @mentara/commons instead of local interface

export interface CommentsService {
  getAll(params?: CommentListParams): Promise<CommentListResponse>;
  getById(id: string): Promise<CommentWithDetails>;
  create(data: CommentCreateInputDto): Promise<CommentWithDetails>; // Now supports parentId for replies
  update(id: string, data: CommentUpdateInputDto): Promise<CommentWithDetails>;
  delete(id: string): Promise<void>;
  
  // Heart functionality (simplified - single toggle endpoint)
  heart(id: string): Promise<HeartToggleResponse>;
  
  // Report functionality for unified comment structure
  report(id: string, data: ReportSubmission): Promise<ReportResponse>;
}

export const createCommentsService = (client: AxiosInstance): CommentsService => ({
  getAll: (params: CommentListParams = {}): Promise<CommentListResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.postId) searchParams.append('postId', params.postId);
    if (params.userId) searchParams.append('userId', params.userId);
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

  // Heart functionality (toggle - backend handles add/remove automatically)
  heart: (id: string): Promise<HeartToggleResponse> =>
    client.post(`/comments/${id}/heart`),

  // Report functionality for inappropriate content
  report: (id: string, data: ReportSubmission): Promise<ReportResponse> =>
    client.post(`/comments/${id}/report`, data),
});