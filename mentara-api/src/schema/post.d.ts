import { IsString, IsOptional } from 'class-validator';

export class PostCreateInputDto {
  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  roomId?: string;

  @IsOptional()
  @IsString()
  files?: PostFileCreateInputDto[];
}

export class PostUpdateInputDto extends PostCreateInputDto {}

export class PostFileCreateInputDto {
  @IsString()
  postId!: string;

  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  type?: string;
}
