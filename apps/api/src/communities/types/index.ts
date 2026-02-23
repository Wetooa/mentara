export interface CreateCommunityDto {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  category?: string;
  tags?: string[];
}

export interface UpdateCommunityDto extends Partial<CreateCommunityDto> {}

export interface CommunityIdParamDto {
  id: string;
}

export interface JoinCommunityDto {
  userId: string;
}

export interface CommunityDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MembershipDto {
  id: string;
  communityId: string;
  userId: string;
  joinedAt: Date;
}
