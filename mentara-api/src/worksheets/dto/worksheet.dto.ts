import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsBoolean,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWorksheetMaterialDto {
  @IsString()
  filename: string;

  @IsString()
  url: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @IsOptional()
  @IsString()
  fileType?: string;
}

export class CreateWorksheetDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  dueDate: string;

  @IsString()
  clientId: string; // User ID for the client

  @IsString()
  therapistId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorksheetMaterialDto)
  materials?: CreateWorksheetMaterialDto[];
}

export class UpdateWorksheetDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(['upcoming', 'past_due', 'completed', 'assigned'])
  status?: 'upcoming' | 'past_due' | 'completed' | 'assigned';

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @IsDateString()
  submittedAt?: string;

  @IsOptional()
  @IsString()
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
  @IsNumber()
  fileSize?: number;

  @IsOptional()
  @IsString()
  fileType?: string;
}

export class SubmitWorksheetDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubmissionDto)
  submissions?: CreateSubmissionDto[];

  @IsBoolean()
  complete: boolean;
}
