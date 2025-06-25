import { IsString, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  content: string;

  @IsString()
  authorId: string;

  @IsString()
  postId: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  isAnonymous?: boolean;
}

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  isAnonymous?: boolean;
}

export class CommentResponseDto {
  id: string;
  content: string;
  heartCount: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  postId: string;
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
