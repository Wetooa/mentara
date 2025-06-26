import { IsJSON } from 'class-validator';

export class CreatePreAssessmentDto {
  @IsJSON()
  questionnaires!: string[] | any;

  @IsJSON()
  answers!: number[][] | any;

  @IsJSON()
  answerMatrix!: number[][] | any;

  @IsJSON()
  scores!: Record<string, number> | any;

  @IsJSON()
  severityLevels!: Record<string, string> | any;

  @IsJSON()
  aiEstimate!: Record<string, any> | any;
}
