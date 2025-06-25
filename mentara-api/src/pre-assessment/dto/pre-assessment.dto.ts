import { IsArray, IsObject, IsString } from 'class-validator';

export class CreatePreAssessmentDto {
  @IsArray()
  @IsString({ each: true })
  questionnaires: string[];

  @IsArray()
  @IsArray({ each: true })
  answers: number[][];

  @IsArray()
  answerMatrix: number[];

  @IsObject()
  scores: Record<string, number>;

  @IsObject()
  severityLevels: Record<string, string>;
}
