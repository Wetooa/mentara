import { IsString, IsOptional } from 'class-validator';

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

export class CommentUpdateInputDto extends CommentCreateInputDto {}

export class CommentResponse {
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

export class CommentFileResponse {
  id: string;
  commentId: string;
  url: string;
  type: string | null;
}

export class ReplyResponse {
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

export class ReplyFileResponse {
  id: string;
  replyId: string;
  url: string;
  type: string | null;
}
