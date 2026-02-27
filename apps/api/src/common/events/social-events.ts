import {
  BaseDomainEvent,
  EventMetadata,
} from './interfaces/domain-event.interface';

// Social Interaction Events

export interface PostCreatedData {
  postId: string;
  authorId: string;
  communityId: string;
  title: string;
  content: string;
  postType: 'text' | 'image' | 'poll' | 'resource';
  tags: string[];
  isAnonymous: boolean;
}

export class PostCreatedEvent extends BaseDomainEvent<PostCreatedData> {
  constructor(data: PostCreatedData, metadata?: EventMetadata) {
    super(data.postId, 'Post', data, metadata);
  }
}

export interface CommentAddedData {
  commentId: string;
  postId: string;
  authorId: string;
  content: string;
  parentCommentId?: string;
  isAnonymous: boolean;
  depth: number;
}

export class CommentAddedEvent extends BaseDomainEvent<CommentAddedData> {
  constructor(data: CommentAddedData, metadata?: EventMetadata) {
    super(data.commentId, 'Comment', data, metadata);
  }
}

export interface PostLikedData {
  postId: string;
  userId: string;
  authorId: string;
  likeType: 'like' | 'helpful' | 'supportive';
  totalLikes: number;
}

export class PostLikedEvent extends BaseDomainEvent<PostLikedData> {
  constructor(data: PostLikedData, metadata?: EventMetadata) {
    super(data.postId, 'Post', data, metadata);
  }
}

export interface PostUnlikedData {
  postId: string;
  userId: string;
  authorId: string;
  likeType: 'like' | 'helpful' | 'supportive';
  totalLikes: number;
}

export class PostUnlikedEvent extends BaseDomainEvent<PostUnlikedData> {
  constructor(data: PostUnlikedData, metadata?: EventMetadata) {
    super(data.postId, 'Post', data, metadata);
  }
}

export interface CommunityJoinedData {
  communityId: string;
  userId: string;
  joinedAt: Date;
  joinMethod: 'request' | 'invitation' | 'auto';
  invitedBy?: string;
}

export class CommunityJoinedEvent extends BaseDomainEvent<CommunityJoinedData> {
  constructor(data: CommunityJoinedData, metadata?: EventMetadata) {
    super(data.communityId, 'Community', data, metadata);
  }
}

export interface CommunityLeftData {
  communityId: string;
  userId: string;
  leftAt: Date;
  leftReason: 'voluntary' | 'removed' | 'banned';
  removedBy?: string;
  membershipDuration: number; // in days
}

export class CommunityLeftEvent extends BaseDomainEvent<CommunityLeftData> {
  constructor(data: CommunityLeftData, metadata?: EventMetadata) {
    super(data.communityId, 'Community', data, metadata);
  }
}

export interface PostReportedData {
  postId: string;
  reportedBy: string;
  reportReason:
    | 'inappropriate'
    | 'spam'
    | 'harassment'
    | 'misinformation'
    | 'other';
  description: string;
  reportedAt: Date;
  authorId: string;
}

export class PostReportedEvent extends BaseDomainEvent<PostReportedData> {
  constructor(data: PostReportedData, metadata?: EventMetadata) {
    super(data.postId, 'Post', data, metadata);
  }
}

export interface PostModerationData {
  postId: string;
  adminId: string;
  action: 'approved' | 'rejected' | 'flagged' | 'deleted';
  reason: string;
  moderatedAt: Date;
  authorId: string;
  reportCount?: number;
}

export class PostModerationEvent extends BaseDomainEvent<PostModerationData> {
  constructor(data: PostModerationData, metadata?: EventMetadata) {
    super(data.postId, 'Post', data, metadata);
  }
}

export interface FollowUserData {
  followerId: string;
  followedUserId: string;
  followType: 'support' | 'professional' | 'friend';
  followedAt: Date;
}

export class FollowUserEvent extends BaseDomainEvent<FollowUserData> {
  constructor(data: FollowUserData, metadata?: EventMetadata) {
    super(
      `${data.followerId}_${data.followedUserId}`,
      'UserFollow',
      data,
      metadata,
    );
  }
}

export interface UnfollowUserData {
  followerId: string;
  followedUserId: string;
  unfollowedAt: Date;
  followDuration: number; // in days
}

export class UnfollowUserEvent extends BaseDomainEvent<UnfollowUserData> {
  constructor(data: UnfollowUserData, metadata?: EventMetadata) {
    super(
      `${data.followerId}_${data.followedUserId}`,
      'UserFollow',
      data,
      metadata,
    );
  }
}
