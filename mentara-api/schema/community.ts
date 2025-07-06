import { IsString } from 'class-validator';

export class CommunityCreateInputDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsString()
  description!: string;

  @IsString()
  imageUrl!: string;
}

export class CommunityUpdateInputDto extends CommunityCreateInputDto {}

export class MembershipCreateInputDto {
  @IsString()
  communityId!: string;

  @IsString()
  role!: string;
}

export class MembershipUpdateInputDto extends MembershipCreateInputDto {}

export type CommunityResponse = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;

  createdAt: Date;
  updatedAt: Date;
};

export type CommunityWithRoomGroupsResponse = CommunityResponse & {
  roomGroups: RoomGroupResponse[];
};

export type RoomGroupResponse = {
  id: string;
  name: string;
  order: number;
  communityId: string;
  rooms: RoomResponse[];
};

export type RoomResponse = {
  id: string;
  name: string;
  order: number;
  roomGroupId: string;
};

export type MembershipResponse = {
  id: string;
  userId: string | null;
  communityId: string;
  role: string;
  joinedAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  } | null;
};

export type PostResponse = {
  id: string;
  title: string;
  content: string;
  userId: string;
  communityId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ModeratorResponse = {
  id: string;
  userId: string;
  communityId: string;
  assignedAt: Date;
};

export type CommunityWithMembersResponse = CommunityResponse & {
  members: MembershipResponse[];
};

export type CommunityWithPostsResponse = CommunityResponse & {
  posts: PostResponse[];
};

export type CommunityWithModeratorsResponse = CommunityResponse & {
  moderators: ModeratorResponse[];
};

export type CommunityStatsResponse = {
  totalMembers: number;
  totalPosts: number;
  activeCommunities: number;
  illnessCommunities: {
    illness: string;
    communityCount: number;
    memberCount: number;
  }[];
};
