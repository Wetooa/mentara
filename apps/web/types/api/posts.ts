// Posts DTOs matching backend exactly

export interface PostCreateInputDto {
  title: string;
  content: string;
  roomId: string;
  tags?: string[];
  isAnonymous?: boolean;
}

export interface PostUpdateInputDto {
  title?: string;
  content?: string;
  tags?: string[];
  isAnonymous?: boolean;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
  roomId: string;
  room: {
    id: string;
    name: string;
    slug: string;
  };
  tags: string[];
  isAnonymous: boolean;
  hearts: PostHeart[];
  heartCount: number;
  isHearted?: boolean; // for current user
  comments: Comment[];
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostHeart {
  id: string;
  postId: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
  parentId?: string;
  replies?: Comment[];
  hearts: CommentHeart[];
  heartCount: number;
  isHearted?: boolean; // for current user
  createdAt: string;
  updatedAt: string;
}

export interface CommentHeart {
  id: string;
  commentId: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
  createdAt: string;
}

export interface PostListParams {
  roomId?: string;
  authorId?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'newest' | 'oldest' | 'popular';
  isAnonymous?: boolean;
}

export interface PostListResponse {
  posts: Post[];
  total: number;
  hasMore: boolean;
}

export interface HeartPostResponse {
  isHearted: boolean;
  heartCount: number;
}

export interface CheckHeartedResponse {
  isHearted: boolean;
}