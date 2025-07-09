// Community DTOs matching backend exactly

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

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
  postingRole: string; // member, moderator, admin
  roomGroupId: string;
}

export interface CommunityWithStructure extends Community {
  roomGroups: RoomGroup[];
}

export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  roomId: string;
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
  role: string; // member, moderator, admin
  joinedAt: string;
  community: Community;
}

export interface CommunityMember {
  id: string;
  userId: string;
  role: string; // member, moderator, admin
  joinedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    email?: string;
  };
}

export interface CommunityStats {
  totalCommunities: number;
  totalMembers: number;
  totalPosts: number;
  totalComments: number;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  roomId: string;
}

export interface CreateCommentRequest {
  content: string;
  postId: string;
}

export interface CreateReplyRequest {
  content: string;
  commentId: string;
}