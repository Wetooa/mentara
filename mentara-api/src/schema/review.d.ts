import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export enum ReviewStatusEnum {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FLAGGED = 'FLAGGED',
}

export class ReviewCreateDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsBoolean()
  isAnonymous!: boolean;

  @IsString()
  therapistId!: string;

  @IsString()
  clientId!: string;

  @IsOptional()
  @IsString()
  meetingId?: string;

  @IsEnum(ReviewStatusEnum)
  status!: ReviewStatusEnum;

  @IsOptional()
  @IsString()
  moderatedBy?: string;

  @IsOptional()
  @IsDateString()
  moderatedAt?: string;

  @IsOptional()
  @IsString()
  moderationNote?: string;

  @IsBoolean()
  isVerified!: boolean;
}

export class ReviewUpdateDto extends ReviewCreateDto {}

export class ReviewStatusDto {
  @IsEnum(ReviewStatusEnum)
  status!: ReviewStatusEnum;
}

export class ModerateReviewDto {
  @IsEnum(ReviewStatusEnum)
  status!: ReviewStatusEnum;

  @IsOptional()
  @IsString()
  moderationNote?: string;
}

export class ReviewFindManyArgsDto {
  @IsOptional()
  @IsString()
  therapistId?: string;
  // Add other fields as needed
}

export class ReviewStatsDto {
  @IsString()
  therapistId!: string;
}
