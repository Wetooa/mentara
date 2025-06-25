import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
} from 'class-validator';

export class CreateWorksheetDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  content: string;

  @IsEnum(['assessment', 'exercise', 'homework'])
  type: 'assessment' | 'exercise' | 'homework';

  @IsEnum(['easy', 'medium', 'hard'])
  difficulty: 'easy' | 'medium' | 'hard';

  @IsNumber()
  estimatedDuration: number; // in minutes

  @IsOptional()
  @IsString()
  therapistId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateWorksheetDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(['assessment', 'exercise', 'homework'])
  type?: 'assessment' | 'exercise' | 'homework';

  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty?: 'easy' | 'medium' | 'hard';

  @IsOptional()
  @IsNumber()
  estimatedDuration?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class CreateSubmissionDto {
  worksheetId: string;
  filename: string;
  url: string;
  fileSize?: number;
  fileType?: string;
}

export class SubmitWorksheetDto {
  submissions: CreateSubmissionDto[];
  complete: boolean;
}
