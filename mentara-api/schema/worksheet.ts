import { IsString, IsOptional, IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class WorksheetCreateInputDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Date)
  @IsDate()
  dueDate!: Date;

  @IsString()
  @IsOptional()
  status?: string;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}

export class WorksheetUpdateInputDto extends WorksheetCreateInputDto {}

export class WorksheetSubmissionCreateInputDto {
  @IsString()
  worksheetId!: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  filename!: string;

  @IsString()
  url!: string;

  @IsString()
  @IsOptional()
  fileType?: string;
}

export class WorksheetSubmissionUpdateInputDto extends WorksheetSubmissionCreateInputDto {}
