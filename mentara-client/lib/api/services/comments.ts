import { AxiosInstance } from 'axios';
import {
  CommentCreateInputDto,
  CommentUpdateInputDto,
  Comment,
  CommentListParams,
  CommentListResponse,
  HeartCommentResponse,
  CreateReplyRequest,
} from '../../types/api/comments';

export interface CommentsService {
  getAll(params?: CommentListParams): Promise<CommentListResponse>;
  getById(id: string): Promise<Comment>;
  create(data: CommentCreateInputDto): Promise<Comment>;
  update(id: string, data: CommentUpdateInputDto): Promise<Comment>;
  delete(id: string): Promise<void>;
  
  // Reply functionality
  createReply(data: CreateReplyRequest): Promise<Comment>;
  
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

  getById: (id: string): Promise<Comment> =>
    client.get(`/comments/${id}`),

  create: (data: CommentCreateInputDto): Promise<Comment> =>
    client.post('/comments', data),

  update: (id: string, data: CommentUpdateInputDto): Promise<Comment> =>
    client.put(`/comments/${id}`, data),

  delete: (id: string): Promise<void> =>
    client.delete(`/comments/${id}`),

  // Reply functionality
  createReply: (data: CreateReplyRequest): Promise<Comment> =>
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