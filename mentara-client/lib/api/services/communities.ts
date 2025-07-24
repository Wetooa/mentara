import { AxiosInstance } from "axios";
import type { Comment, CreateCommentRequest } from "@/types/api/communities";

export interface CommunityRecommendation {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  memberCount: number;
  compatibilityScore: number;
  score: number;
  reason: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  id: string;
  name: string;
  order: number;
  postingRole: string;
  roomGroupId: string;
}

export interface RoomGroup {
  id: string;
  name: string;
  order: number;
  communityId: string;
  rooms: Room[];
}

export interface CommunityWithStructure {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  roomGroups: RoomGroup[];
}

export interface CommunityMembership {
  id: string;
  joinedAt: Date;
  communityId: string;
  userId: string;
  community: {
    id: string;
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
  };
}

export interface PostData {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  roomId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  hearts: Array<{
    id: string;
    userId: string;
    postId: string;
  }>;
  _count: {
    hearts: number;
    comments: number;
  };
}

export interface CommunityStats {
  totalCommunities: number;
  totalPosts: number;
  totalMembers: number;
  activeCommunities: number;
}


/**
 * Community API service for recommendations, joining, and management
 */
export function createCommunityService(axios: AxiosInstance) {
  return {
    /**
     * Get personalized community recommendations based on AI predictions
     */
    async getRecommendations(): Promise<{
      success: boolean;
      data: CommunityRecommendation[];
      message: string;
    }> {
      const { data } = await axios.get("/communities/recommendations/me");
      return data;
    },

    /**
     * Generate fresh community recommendations
     */
    async generateRecommendations(force = false): Promise<{
      success: boolean;
      data: CommunityRecommendation[];
      message: string;
    }> {
      const { data } = await axios.post("/communities/recommendations/generate", { force });
      return data;
    },

    /**
     * Join multiple recommended communities immediately
     */
    async joinCommunities(communitySlugs: string[]): Promise<{
      success: boolean;
      data: {
        successfulJoins: Array<{ 
          communityId: string; 
          communityName: string; 
          slug: string; 
        }>;
        failedJoins: Array<{ 
          slug: string; 
          reason: string; 
        }>;
      };
      message: string;
    }> {
      const { data } = await axios.post("/communities/recommendations/join", {
        communitySlugs
      });
      return data;
    },

    /**
     * Refresh community recommendations
     */
    async refreshRecommendations(): Promise<{
      success: boolean;
      message: string;
    }> {
      const { data } = await axios.post("/communities/recommendations/refresh");
      return data;
    },

    /**
     * Get community details
     */
    async getCommunityDetails(communityId: string) {
      const { data } = await axios.get(`/communities/${communityId}`);
      return data;
    },

    /**
     * Join a specific community
     */
    async joinCommunity(communityId: string) {
      const { data } = await axios.post(`/communities/${communityId}/join`);
      return data;
    },

    /**
     * Leave a community
     */
    async leaveCommunity(communityId: string) {
      const { data } = await axios.post(`/communities/${communityId}/leave`);
      return data;
    },

    /**
     * Get user's communities
     */
    async getMyCommunities() {
      const { data } = await axios.get("/communities/me");
      return data;
    },

    /**
     * Get all available communities
     */
    async getAllCommunities(params?: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
    }) {
      const { data } = await axios.get("/communities", { params });
      return data;
    },

    /**
     * Get community posts
     */
    async getCommunityPosts(communityId: string, params?: {
      page?: number;
      limit?: number;
      sortBy?: 'newest' | 'popular' | 'trending';
    }) {
      const { data } = await axios.get(`/communities/${communityId}/posts`, { params });
      return data;
    },


    /**
     * Interact with recommendation (accept/reject)
     */
    async interactWithRecommendation(
      recommendationId: string, 
      action: 'accept' | 'reject'
    ) {
      const { data } = await axios.put(
        `/communities/recommendations/${recommendationId}/interact`,
        { action }
      );
      return data;
    },

    /**
     * Get recommendation statistics
     */
    async getRecommendationStats() {
      const { data } = await axios.get("/communities/recommendations/stats/me");
      return data;
    },

    /**
     * Get community with full structure (room groups and rooms)
     */
    async getCommunityWithStructure(communityId: string): Promise<CommunityWithStructure> {
      const { data } = await axios.get(`/communities/${communityId}/with-structure`);
      return data;
    },

    /**
     * Get all communities with full structure (room groups and rooms)
     */
    async getCommunitiesWithStructure(): Promise<CommunityWithStructure[]> {
      const { data } = await axios.get('/communities/with-structure');
      return data;
    },

    /**
     * Create a room group in a community (admin/moderator only)
     */
    async createRoomGroup(communityId: string, name: string, order: number): Promise<RoomGroup> {
      const { data } = await axios.post(`/communities/${communityId}/room-group`, {
        name,
        order,
      });
      return data;
    },

    /**
     * Create a room in a room group (admin/moderator only)
     */
    async createRoom(roomGroupId: string, name: string, order: number): Promise<Room> {
      const { data } = await axios.post(`/communities/room-group/${roomGroupId}/room`, {
        name,
        order,
      });
      return data;
    },

    /**
     * Get community members
     */
    async getCommunityMembers(communityId: string, limit?: number, offset?: number): Promise<{
      members: any[];
      total: number;
    }> {
      const params = { limit, offset };
      const { data } = await axios.get(`/communities/${communityId}/members`, { params });
      return data;
    },

    /**
     * Get user's community memberships
     */
    async getMyMemberships(): Promise<CommunityMembership[]> {
      const { data } = await axios.get('/communities/memberships/me');
      return data;
    },

    /**
     * Get my communities with full structure (room groups and rooms) in one batch call
     * This replaces the need for multiple individual getCommunityWithStructure calls
     */
    async getMyCommunitiesWithStructure(): Promise<CommunityWithStructure[]> {
      const { data } = await axios.get('/communities/me/with-structure');
      return data;
    },

    /**
     * Get posts by room
     */
    async getPostsByRoom(roomId: string): Promise<{
      posts: PostData[];
      pagination: {
        total: number;
        page: number;
        limit: number;
      };
    }> {
      const { data } = await axios.get(`/communities/rooms/${roomId}/posts`);
      return data;
    },

    /**
     * Get community statistics
     */
    async getCommunityStats(): Promise<CommunityStats> {
      const { data } = await axios.get('/communities/stats');
      return data;
    },

    /**
     * Create a post in a room
     */
    async createPost(postData: {
      title: string;
      content: string;
      roomId: string;
      files?: File[];
    }): Promise<PostData> {
      // If files are included, use FormData for multipart submission
      if (postData.files && postData.files.length > 0) {
        const formData = new FormData();
        formData.append('title', postData.title);
        formData.append('content', postData.content);
        formData.append('roomId', postData.roomId);
        
        // Append each file
        postData.files.forEach((file) => {
          formData.append('files', file);
        });

        const { data } = await axios.post('/communities/posts', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return data;
      } else {
        // No files, use regular JSON submission
        const { data } = await axios.post('/communities/posts', {
          title: postData.title,
          content: postData.content,
          roomId: postData.roomId,
        });
        return data;
      }
    },

    /**
     * Heart a post
     */
    async heartPost(postId: string): Promise<{ success: boolean }> {
      const { data } = await axios.post(`/communities/posts/${postId}/heart`);
      return data;
    },

    /**
     * Remove heart from a post
     */
    async unheartPost(postId: string): Promise<{ success: boolean }> {
      const { data } = await axios.delete(`/communities/posts/${postId}/heart`);
      return data;
    },

    /**
     * Get joined communities for current user
     */
    async getJoined(): Promise<CommunityWithStructure[]> {
      const { data } = await axios.get('/communities/me/joined');
      return data;
    },

    /**
     * Get recommended communities
     */
    async getRecommended(): Promise<CommunityWithStructure[]> {
      const { data } = await axios.get('/communities/me/recommended');
      return data;
    },

    /**
     * Get recent community activity
     */
    async getRecentActivity(): Promise<any[]> {
      const { data } = await axios.get('/communities/activity/recent');
      return data;
    },


    /**
     * Join a community by ID
     */
    async join(communityId: string): Promise<{ success: boolean }> {
      const { data } = await axios.post(`/communities/${communityId}/join`);
      return data;
    },

    /**
     * Leave a community by ID
     */
    async leave(communityId: string): Promise<{ success: boolean }> {
      const { data } = await axios.post(`/communities/${communityId}/leave`);
      return data;
    },

    /**
     * Request to join a private community
     */
    async requestJoin(communityId: string): Promise<{ success: boolean }> {
      const { data } = await axios.post(`/communities/${communityId}/request-join`);
      return data;
    },

    // Comment Management Methods

    /**
     * Get all comments for a post
     */
    async getCommentsByPost(postId: string): Promise<Comment[]> {
      const { data } = await axios.get(`/comments/post/${postId}`);
      return data;
    },

    /**
     * Create a new comment
     */
    async createComment(request: CreateCommentRequest): Promise<Comment> {
      const { data } = await axios.post('/comments', request);
      return data;
    },

    /**
     * Update a comment (only by owner)
     */
    async updateComment(commentId: string, content: string): Promise<Comment> {
      const { data } = await axios.put(`/comments/${commentId}`, { content });
      return data;
    },

    /**
     * Delete a comment (only by owner)
     */
    async deleteComment(commentId: string): Promise<Comment> {
      const { data } = await axios.delete(`/comments/${commentId}`);
      return data;
    },

    /**
     * Heart/like a comment
     */
    async heartComment(commentId: string): Promise<{ hearted: boolean }> {
      const { data } = await axios.post(`/comments/${commentId}/heart`);
      return data;
    },

    /**
     * Remove heart/like from a comment
     */
    async unheartComment(commentId: string): Promise<{ hearted: boolean }> {
      const { data } = await axios.post(`/comments/${commentId}/heart`);
      return data;
    },

    /**
     * Check if a comment is hearted by current user
     */
    async isCommentHearted(commentId: string): Promise<{ hearted: boolean }> {
      const { data } = await axios.get(`/comments/${commentId}/hearted`);
      return data;
    },

    /**
     * Report a comment for inappropriate content
     */
    async reportComment(commentId: string, reason: string, content?: string): Promise<{ success: boolean; reportId: string }> {
      const { data } = await axios.post(`/comments/${commentId}/report`, { reason, content });
      return data;
    },

    // Post Edit Methods

    /**
     * Update a post (only by owner)
     */
    async updatePost(postId: string, postData: { title?: string; content?: string }): Promise<PostData> {
      const { data } = await axios.put(`/posts/${postId}`, postData);
      return data;
    },

    /**
     * Delete a post (only by owner)
     */
    async deletePost(postId: string): Promise<PostData> {
      const { data } = await axios.delete(`/posts/${postId}`);
      return data;
    },

    /**
     * Get individual post by ID with full details (comments, hearts, etc.)
     */
    async getPost(postId: string): Promise<PostData> {
      const { data } = await axios.get(`/posts/${postId}`);
      return data;
    },
  };
}

export type CommunityService = ReturnType<typeof createCommunityService>;