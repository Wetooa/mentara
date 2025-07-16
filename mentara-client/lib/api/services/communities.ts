import { AxiosInstance } from 'axios';
import {
  Community,
  CommunityMember,
  CreatePostDto,
  Post,
  PostCreateInputDto,
  PostRoomParamsDto,
  PostParamsDto,
  CreateNestedCommentDto,
  CreateCommunityDto,
  CreateRoomDto,
  CreateRoomGroupDto,
  CommunityQuery,
  GetCommunityMembersQueryDto,
  CommunityIdParam,
  CommunityParamsDto,
  CommunitySlugParamsDto,
  RoomGroupParamsDto,
  RoomParamsDto,
  UserParamsDto,
  BulkAssignCommunitiesDto,
} from '@mentara/commons';

// Local types for extended structures not in commons
export interface RoomGroup {
  id: string;
  name: string;
  order: number;
  communityId: string;
  rooms: Room[];
}

export interface Room {
  id: string;
  name: string;
  order: number;
  postingRole: string;
  roomGroupId: string;
}

export interface CommunityWithStructure extends Community {
  roomGroups: RoomGroup[];
}

export interface PostHeart {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  hearts: CommentHeart[];
  replies: Reply[];
}

export interface CommentHeart {
  id: string;
  commentId: string;
  userId: string;
  createdAt: string;
}

export interface Reply {
  id: string;
  commentId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

export interface Membership {
  id: string;
  communityId: string;
  userId: string;
  role: string;
  joinedAt: string;
  community: Community;
}

export interface CommunityStats {
  totalCommunities: number;
  totalMembers: number;
  totalPosts: number;
  totalComments: number;
}

// Extended Post interface with populated fields
export interface PostWithDetails extends Post {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  hearts: PostHeart[];
  comments: Comment[];
  _count: {
    hearts: number;
    comments: number;
  };
}

// Community service factory
export const createCommunityService = (client: AxiosInstance) => ({
  // Communities
  getAllCommunities: (): Promise<Community[]> =>
    client.get('/communities'),

  getCommunityById: (id: string): Promise<Community> =>
    client.get(`/communities/${id}`),

  getCommunityBySlug: (slug: string): Promise<Community> =>
    client.get(`/communities/slug/${slug}`),

  getCommunitiesWithStructure: (): Promise<CommunityWithStructure[]> =>
    client.get('/communities/with-structure'),

  getCommunityWithStructure: (id: string): Promise<CommunityWithStructure> =>
    client.get(`/communities/${id}/with-structure`),

  getCommunityStats: (): Promise<CommunityStats> =>
    client.get('/communities/stats'),

  // User's Communities
  getMyMemberships: (): Promise<Membership[]> =>
    client.get('/communities/user/me'),

  getUserMemberships: (userId: string): Promise<Membership[]> =>
    client.get(`/communities/user/${userId}`),

  // Community Membership
  joinCommunity: (communityId: string): Promise<{ joined: boolean }> =>
    client.post(`/communities/${communityId}/join`),

  leaveCommunity: (communityId: string): Promise<{ left: boolean }> =>
    client.post(`/communities/${communityId}/leave`),

  getCommunityMembers: (communityId: string, limit = 50, offset = 0): Promise<{ members: CommunityMember[]; total: number }> => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return client.get(`/communities/${communityId}/members?${params.toString()}`);
  },

  // Room Groups and Rooms
  createRoomGroup: (communityId: string, name: string, order: number): Promise<RoomGroup> =>
    client.post(`/communities/${communityId}/room-group`, { name, order }),

  createRoom: (roomGroupId: string, name: string, order: number): Promise<Room> =>
    client.post(`/communities/room-group/${roomGroupId}/room`, { name, order }),

  getRoomsByGroup: (roomGroupId: string): Promise<Room[]> =>
    client.get(`/communities/room-group/${roomGroupId}/rooms`),

  // Posts
  createPost: (data: PostCreateInputDto): Promise<Post> =>
    client.post('/posts', data),

  getPostsByRoom: (roomId: string, limit = 20, offset = 0): Promise<{ posts: PostWithDetails[]; total: number }> => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return client.get(`/posts/room/${roomId}?${params.toString()}`);
  },

  getPostById: (postId: string): Promise<PostWithDetails> =>
    client.get(`/posts/${postId}`),

  updatePost: (postId: string, data: Partial<PostCreateInputDto>): Promise<Post> =>
    client.put(`/posts/${postId}`, data),

  deletePost: (postId: string): Promise<{ deleted: boolean }> =>
    client.delete(`/posts/${postId}`),

  heartPost: (postId: string): Promise<{ hearted: boolean }> =>
    client.post(`/posts/${postId}/heart`),

  unheartPost: (postId: string): Promise<{ unhearted: boolean }> =>
    client.delete(`/posts/${postId}/heart`),

  // Comments
  createComment: (data: CreateNestedCommentDto): Promise<Comment> =>
    client.post('/comments', data),

  getCommentsByPost: (postId: string): Promise<Comment[]> =>
    client.get(`/comments/post/${postId}`),

  updateComment: (commentId: string, content: string): Promise<Comment> =>
    client.put(`/comments/${commentId}`, { content }),

  deleteComment: (commentId: string): Promise<{ deleted: boolean }> =>
    client.delete(`/comments/${commentId}`),

  heartComment: (commentId: string): Promise<{ hearted: boolean }> =>
    client.post(`/comments/${commentId}/heart`),

  unheartComment: (commentId: string): Promise<{ unhearted: boolean }> =>
    client.delete(`/comments/${commentId}/heart`),

  // Replies
  createReply: (data: CreateNestedCommentDto): Promise<Reply> =>
    client.post('/replies', data),

  updateReply: (replyId: string, content: string): Promise<Reply> =>
    client.put(`/replies/${replyId}`, { content }),

  deleteReply: (replyId: string): Promise<{ deleted: boolean }> =>
    client.delete(`/replies/${replyId}`),

  // Community Assignment
  assignCommunitiesToMe: (): Promise<{ assignedCommunities: string[] }> =>
    client.post('/communities/assign/me'),

  getMyRecommendedCommunities: (): Promise<{ recommendedCommunities: string[] }> =>
    client.get('/communities/recommended/me'),

  assignCommunitiesToUser: (userId: string): Promise<{ assignedCommunities: string[] }> =>
    client.post(`/communities/assign/${userId}`),

  bulkAssignCommunities: (userIds: string[]): Promise<{ results: { [userId: string]: string[] } }> =>
    client.post('/communities/assign/bulk', { userIds }),
});

export type CommunityService = ReturnType<typeof createCommunityService>;