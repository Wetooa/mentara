import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsNotEmpty()
  postId: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;
}

export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;
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
