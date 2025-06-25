import { IsString, IsOptional } from 'class-validator';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  authorId: string;

  @IsOptional()
  @IsString()
  communityId?: string;

  @IsOptional()
  isAnonymous?: boolean;
}

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  isAnonymous?: boolean;
}

export class PostResponseDto {
  id: string;
  title: string;
  content: string;
  heartCount: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  communityId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  community: {
    id: string;
    name: string;
    slug: string;
  };
  comments: CommentResponseDto[];
  files: {
    id: string;
    url: string;
  }[];
  isHeartedByUser?: boolean;
}

export class CommentResponseDto {
  id: string;
  content: string;
  heartCount: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  parentId?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  replies: CommentResponseDto[];
  files: {
    id: string;
    url: string;
  }[];
  isHeartedByUser?: boolean;
}
