import { IsString, IsArray, IsNumber, IsOptional, IsObject } from 'class-validator';

export class CreatePreAssessmentDto {
  @IsString()
  userId!: string;

  @IsArray()
  @IsString({ each: true })
  questionnaires!: string[];

  @IsArray()
  @IsArray({ each: true })
  @IsNumber({}, { each: true, always: true })
  answers!: number[][];

  @IsArray()
  @IsNumber({}, { each: true })
  answerMatrix!: number[];

  @IsObject()
  scores!: Record<string, number>;

  @IsObject()
  severityLevels!: Record<string, string>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdatePreAssessmentDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  questionnaires?: string[];

  @IsOptional()
  @IsArray()
  @IsArray({ each: true })
  @IsNumber({}, { each: true, always: true })
  answers?: number[][];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  answerMatrix?: number[];

  @IsOptional()
  @IsObject()
  scores?: Record<string, number>;

  @IsOptional()
  @IsObject()
  severityLevels?: Record<string, string>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}