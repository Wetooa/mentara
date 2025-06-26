import { IsString, IsOptional, IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export interface WorksheetResponse {
  id: string;
  clientId: string;
  therapistId?: string | null;
  title: string;
  instructions?: string | null;
  description?: string | null;
  dueDate: Date;
  status: string;
  isCompleted: boolean;
  submittedAt?: Date | null;
  feedback?: string | null;
  createdAt: Date;
  updatedAt: Date;
  materials?: any[];
  submissions?: any[];
  client?: any;
  therapist?: any;
}

export class WorksheetCreateInputDto {
  @IsString()
  clientId!: string;

  @IsString()
  @IsOptional()
  therapistId?: string;

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
  clientId!: string;

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
