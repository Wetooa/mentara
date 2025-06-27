import { IsString, IsOptional } from 'class-validator';
import { UserResponse } from './auth';

export class CommentCreateInputDto {
  @IsString()
  postId!: string;

  @IsString()
  content!: string;

  @IsOptional()
  files?: CommentFileCreateInputDto[];
}

export class CommentUpdateInputDto extends CommentCreateInputDto {}

export class CommentFileCreateInputDto {
  @IsString()
  commentId!: string;

  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  type?: string;
}

export class ReplyCreateInputDto {
  @IsString()
  commentId!: string;

  @IsString()
  content!: string;

  @IsOptional()
  files?: ReplyFileCreateInputDto[];
}

export class ReplyUpdateInputDto extends ReplyCreateInputDto {}

export class ReplyFileCreateInputDto {
  @IsString()
  replyId!: string;

  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  type?: string;
}

export interface CommentResponse {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;

  userId: string;
  user: UserResponse;

  postId: string;

  hearts: number;
  files: CommentFileResponse[];
}

export interface CommentFileResponse {
  id: string;
  commentId: string;
  url: string;
  type: string | null;
}

export interface ReplyResponse {
  id: string;
  commentId: string;

  content: string;

  createdAt: Date;
  updatedAt: Date;

  userId: string;
  user: UserResponse;

  hearts: number;
  files: ReplyFileResponse[];
  replies: ReplyResponse[];
}

export interface ReplyFileResponse {
  id: string;
  replyId: string;
  url: string;
  type: string | null;
}