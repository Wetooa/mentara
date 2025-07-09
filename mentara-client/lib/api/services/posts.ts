import { AxiosInstance } from "axios";
import {
  PostCreateInputDto,
  PostUpdateInputDto,
  Post,
  PostListParams,
  PostListResponse,
  HeartPostResponse,
  CheckHeartedResponse,
} from "@/types/api/posts";

export interface PostsService {
  getAll(params?: PostListParams): Promise<PostListResponse>;
  getById(id: string): Promise<Post>;
  create(data: PostCreateInputDto): Promise<Post>;
  update(id: string, data: PostUpdateInputDto): Promise<Post>;
  delete(id: string): Promise<void>;
  getByUser(
    userId: string,
    params?: Omit<PostListParams, "authorId">
  ): Promise<PostListResponse>;
  getByRoom(
    roomId: string,
    params?: Omit<PostListParams, "roomId">
  ): Promise<PostListResponse>;

  // Heart/Like functionality
  heart(id: string): Promise<HeartPostResponse>;
  unheart(id: string): Promise<HeartPostResponse>;
  checkHearted(id: string): Promise<CheckHeartedResponse>;
}

export const createPostsService = (client: AxiosInstance): PostsService => ({
  getAll: (params: PostListParams = {}): Promise<PostListResponse> => {
    const searchParams = new URLSearchParams();

    if (params.roomId) searchParams.append("roomId", params.roomId);
    if (params.authorId) searchParams.append("authorId", params.authorId);
    if (params.tags?.length) {
      params.tags.forEach((tag) => searchParams.append("tags", tag));
    }
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.offset) searchParams.append("offset", params.offset.toString());
    if (params.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params.isAnonymous !== undefined)
      searchParams.append("isAnonymous", params.isAnonymous.toString());

    const queryString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";
    return client.get(`/posts${queryString}`);
  },

  getById: (id: string): Promise<Post> => client.get(`/posts/${id}`),

  create: (data: PostCreateInputDto): Promise<Post> =>
    client.post("/posts", data),

  update: (id: string, data: PostUpdateInputDto): Promise<Post> =>
    client.put(`/posts/${id}`, data),

  delete: (id: string): Promise<void> => client.delete(`/posts/${id}`),

  getByUser: (
    userId: string,
    params: Omit<PostListParams, "authorId"> = {}
  ): Promise<PostListResponse> => {
    const searchParams = new URLSearchParams();

    if (params.roomId) searchParams.append("roomId", params.roomId);
    if (params.tags?.length) {
      params.tags.forEach((tag) => searchParams.append("tags", tag));
    }
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.offset) searchParams.append("offset", params.offset.toString());
    if (params.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params.isAnonymous !== undefined)
      searchParams.append("isAnonymous", params.isAnonymous.toString());

    const queryString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";
    return client.get(`/posts/user/${userId}${queryString}`);
  },

  getByRoom: (
    roomId: string,
    params: Omit<PostListParams, "roomId"> = {}
  ): Promise<PostListResponse> => {
    const searchParams = new URLSearchParams();

    if (params.authorId) searchParams.append("authorId", params.authorId);
    if (params.tags?.length) {
      params.tags.forEach((tag) => searchParams.append("tags", tag));
    }
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.offset) searchParams.append("offset", params.offset.toString());
    if (params.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params.isAnonymous !== undefined)
      searchParams.append("isAnonymous", params.isAnonymous.toString());

    const queryString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";
    return client.get(`/posts/room/${roomId}${queryString}`);
  },

  // Heart/Like functionality
  heart: (id: string): Promise<HeartPostResponse> =>
    client.post(`/posts/${id}/heart`),

  unheart: (id: string): Promise<HeartPostResponse> =>
    client.delete(`/posts/${id}/heart`),

  checkHearted: (id: string): Promise<CheckHeartedResponse> =>
    client.get(`/posts/${id}/hearted`),
});
