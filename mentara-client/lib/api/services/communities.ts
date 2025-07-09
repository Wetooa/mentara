import { AxiosInstance } from 'axios';
import {
  Community,
  RoomGroup,
  Room,
  CommunityWithStructure,
  Post,
  PostHeart,
  Comment,
  CommentHeart,
  Reply,
  Membership,
  CommunityMember,
  CommunityStats,
  CreatePostRequest,
  CreateCommentRequest,
  CreateReplyRequest,
} from '@/types/api/communities';

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
  createPost: (data: CreatePostRequest): Promise<Post> =>
    client.post('/posts', data),

  getPostsByRoom: (roomId: string, limit = 20, offset = 0): Promise<{ posts: Post[]; total: number }> => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return client.get(`/posts/room/${roomId}?${params.toString()}`);
  },

  getPostById: (postId: string): Promise<Post> =>
    client.get(`/posts/${postId}`),

  updatePost: (postId: string, data: Partial<CreatePostRequest>): Promise<Post> =>
    client.put(`/posts/${postId}`, data),

  deletePost: (postId: string): Promise<{ deleted: boolean }> =>
    client.delete(`/posts/${postId}`),

  heartPost: (postId: string): Promise<{ hearted: boolean }> =>
    client.post(`/posts/${postId}/heart`),

  unheartPost: (postId: string): Promise<{ unhearted: boolean }> =>
    client.delete(`/posts/${postId}/heart`),

  // Comments
  createComment: (data: CreateCommentRequest): Promise<Comment> =>
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
  createReply: (data: CreateReplyRequest): Promise<Reply> =>
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