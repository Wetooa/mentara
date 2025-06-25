import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsNotEmpty()
  communityId: string;
}

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;
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
