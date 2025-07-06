import { AxiosInstance } from 'axios';

// Types
export interface Community {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  moderators: string[];
  tags: string[];
  rules?: string[];
  image?: string;
}

export interface CreateCommunityRequest {
  name: string;
  description: string;
  isPrivate?: boolean;
  tags?: string[];
  rules?: string[];
  image?: string;
}

export interface UpdateCommunityRequest {
  name?: string;
  description?: string;
  isPrivate?: boolean;
  tags?: string[];
  rules?: string[];
  image?: string;
}

export interface CommunityListParams {
  isPrivate?: boolean;
  tags?: string[];
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CommunityListResponse {
  communities: Community[];
  total: number;
  hasMore: boolean;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  communityId: string;
  authorId: string;
  isPinned: boolean;
  isLocked: boolean;
  tags: string[];
  upvotes: number;
  downvotes: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    isAnonymous: boolean;
  };
  community: {
    id: string;
    name: string;
  };
}

export interface CreatePostRequest {
  title: string;
  content: string;
  communityId: string;
  tags?: string[];
  isAnonymous?: boolean;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  tags?: string[];
  isPinned?: boolean;
  isLocked?: boolean;
}

export interface PostListParams {
  communityId?: string;
  authorId?: string;
  tags?: string[];
  isPinned?: boolean;
  isLocked?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Communities service factory
export const createCommunitiesService = (client: AxiosInstance) => ({
  // Community management
  communities: {
    // Get all communities
    getAll: (params: CommunityListParams = {}): Promise<CommunityListResponse> => {
      const searchParams = new URLSearchParams();
      
      if (params.isPrivate !== undefined) searchParams.append('isPrivate', params.isPrivate.toString());
      if (params.tags?.length) searchParams.append('tags', params.tags.join(','));
      if (params.search) searchParams.append('search', params.search);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/communities${queryString}`);
    },

    // Get community by ID
    getById: (id: string): Promise<Community> =>
      client.get(`/communities/${id}`),

    // Create new community
    create: (data: CreateCommunityRequest): Promise<Community> =>
      client.post('/communities', data),

    // Update community
    update: (id: string, data: UpdateCommunityRequest): Promise<Community> =>
      client.put(`/communities/${id}`, data),

    // Delete community
    delete: (id: string): Promise<void> =>
      client.delete(`/communities/${id}`),

    // Get communities by user ID
    getByUserId: (userId: string): Promise<Community[]> =>
      client.get(`/communities/user/${userId}`),

    // Get my communities
    getMy: (): Promise<Community[]> =>
      client.get('/communities/my'),

    // Join community
    join: (id: string): Promise<void> =>
      client.post(`/communities/${id}/join`),

    // Leave community
    leave: (id: string): Promise<void> =>
      client.post(`/communities/${id}/leave`),

    // Get community members
    getMembers: (id: string): Promise<any[]> =>
      client.get(`/communities/${id}/members`),
  },

  // Post management
  posts: {
    // Get all posts
    getAll: (params: PostListParams = {}): Promise<{ posts: Post[]; total: number; hasMore: boolean }> => {
      const searchParams = new URLSearchParams();
      
      if (params.communityId) searchParams.append('communityId', params.communityId);
      if (params.authorId) searchParams.append('authorId', params.authorId);
      if (params.tags?.length) searchParams.append('tags', params.tags.join(','));
      if (params.isPinned !== undefined) searchParams.append('isPinned', params.isPinned.toString());
      if (params.isLocked !== undefined) searchParams.append('isLocked', params.isLocked.toString());
      if (params.search) searchParams.append('search', params.search);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/posts${queryString}`);
    },

    // Get post by ID
    getById: (id: string): Promise<Post> =>
      client.get(`/posts/${id}`),

    // Create new post
    create: (data: CreatePostRequest): Promise<Post> =>
      client.post('/posts', data),

    // Update post
    update: (id: string, data: UpdatePostRequest): Promise<Post> =>
      client.put(`/posts/${id}`, data),

    // Delete post
    delete: (id: string): Promise<void> =>
      client.delete(`/posts/${id}`),

    // Get posts by user ID
    getByUserId: (userId: string): Promise<Post[]> =>
      client.get(`/posts/user/${userId}`),

    // Get posts by community ID
    getByCommunityId: (communityId: string): Promise<Post[]> =>
      client.get(`/posts/community/${communityId}`),

    // Vote on post
    upvote: (id: string): Promise<void> =>
      client.post(`/posts/${id}/upvote`),

    downvote: (id: string): Promise<void> =>
      client.post(`/posts/${id}/downvote`),

    // Remove vote
    removeVote: (id: string): Promise<void> =>
      client.delete(`/posts/${id}/vote`),
  },
});

export type CommunitiesService = ReturnType<typeof createCommunitiesService>;