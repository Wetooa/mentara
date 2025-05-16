import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsArray,
} from 'class-validator';

export class CreateWorksheetDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsDateString()
  dueDate: string;

  @IsString()
  userId: string;

  @IsString()
  therapistId: string;

  @IsArray()
  @IsOptional()
  materials?: {
    filename: string;
    url: string;
    fileSize?: number;
    fileType?: string;
  }[];
}

export class UpdateWorksheetDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  status?: 'upcoming' | 'past_due' | 'completed';

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @IsDateString()
  @IsOptional()
  submittedAt?: string;

  @IsString()
  @IsOptional()
  feedback?: string;
}

export class CreateSubmissionDto {
  @IsString()
  worksheetId: string;

  @IsString()
  filename: string;

  @IsString()
  url: string;

  @IsOptional()
  fileSize?: number;

  @IsString()
  @IsOptional()
  fileType?: string;
}

export class SubmitWorksheetDto {
  @IsArray()
  submissions: CreateSubmissionDto[];

  @IsBoolean()
  complete: boolean;
}
