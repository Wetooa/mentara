import { AxiosInstance } from "axios";
import {
  PostCreateInputDto,
  PostUpdateInputDto,
  Post,
  PostQuery,
  PostIdParam,
  PostParamsDto,
  PostRoomParamsDto,
  VoteContentDto,
  GiveAwardDto,
  CreateNestedCommentDto,
  ReportContentDto,
  PostListParamsDto,
  PostByUserParamsDto,
  PostByRoomParamsDto,
  PostListParamsDtoSchema,
  PostByUserParamsDtoSchema,
  PostByRoomParamsDtoSchema,
  // UI-specific data structures
  PostHeart,
  CommentHeart,
  Comment,
  PostListResponse,
  PostWithDetails,
  HeartPostResponse,
  CheckHeartedResponse,
} from 'mentara-commons';

// Re-export commons types for backward compatibility
export type {
  PostCreateInputDto,
  PostUpdateInputDto,
  Post,
  PostQuery,
  PostIdParam,
  PostParamsDto,
  PostRoomParamsDto,
  VoteContentDto,
  GiveAwardDto,
  CreateNestedCommentDto,
  ReportContentDto,
  PostListParamsDto,
  PostByUserParamsDto,
  PostByRoomParamsDto,
  // UI-specific data structures
  PostHeart,
  CommentHeart,
  Comment,
  PostListResponse,
  PostWithDetails,
  HeartPostResponse,
  CheckHeartedResponse,
};

// All post types are now imported from mentara-commons

// Service interface for type checking (use factory function instead)
interface PostsService {
  getAll(params?: PostListParamsDto): Promise<PostListResponse>;
  getById(id: string): Promise<PostWithDetails>;
  create(data: PostCreateInputDto): Promise<PostWithDetails>;
  update(id: string, data: PostUpdateInputDto): Promise<PostWithDetails>;
  delete(id: string): Promise<void>;
  getByUser(
    userId: string,
    params?: Omit<PostListParamsDto, "authorId">
  ): Promise<PostListResponse>;
  getByRoom(
    roomId: string,
    params?: Omit<PostListParamsDto, "roomId">
  ): Promise<PostListResponse>;

  // Heart/Like functionality
  heart(id: string): Promise<HeartPostResponse>;
  unheart(id: string): Promise<HeartPostResponse>;
  checkHearted(id: string): Promise<CheckHeartedResponse>;
}

// Posts service factory
export const createPostsService = (client: AxiosInstance) => ({
  getAll: async (params: PostListParamsDto = {}): Promise<PostListResponse> => {
    const validatedParams = PostListParamsDtoSchema.parse(params);
    return client.get('/posts', { params: validatedParams });
  },

  getById: (id: string): Promise<PostWithDetails> => client.get(`/posts/${id}`),

  create: (data: PostCreateInputDto): Promise<PostWithDetails> =>
    client.post("/posts", data),

  update: (id: string, data: PostUpdateInputDto): Promise<PostWithDetails> =>
    client.put(`/posts/${id}`, data),

  delete: (id: string): Promise<void> => client.delete(`/posts/${id}`),

  getByUser: async (
    userId: string,
    params: Omit<PostListParamsDto, "authorId"> = {}
  ): Promise<PostListResponse> => {
    const validatedParams = PostByUserParamsDtoSchema.parse({ userId, ...params });
    return client.get(`/posts/user/${userId}`, { params: validatedParams });
  },

  getByRoom: async (
    roomId: string,
    params: Omit<PostListParamsDto, "roomId"> = {}
  ): Promise<PostListResponse> => {
    const validatedParams = PostByRoomParamsDtoSchema.parse({ roomId, ...params });
    return client.get(`/posts/room/${roomId}`, { params: validatedParams });
  },

  // Heart/Like functionality
  heart: (id: string): Promise<HeartPostResponse> =>
    client.post(`/posts/${id}/heart`),

  // NOTE: Backend missing DELETE endpoint for unheart - currently using same POST endpoint
  // TODO: Backend should implement DELETE /posts/:id/heart for proper RESTful design
  unheart: (id: string): Promise<HeartPostResponse> =>
    client.post(`/posts/${id}/heart`), // Should be DELETE but backend only has POST

  checkHearted: (id: string): Promise<CheckHeartedResponse> =>
    client.get(`/posts/${id}/hearted`),
});

export type PostsService = ReturnType<typeof createPostsService>;
