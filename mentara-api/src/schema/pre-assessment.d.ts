import { IsJSON } from 'class-validator';

export class CreatePreAssessmentDto {
  @IsJSON()
  questionnaires!: JsonValue;

  @IsJSON()
  answers!: JsonValue;

  @IsJSON()
  answerMatrix!: JsonValue;

  @IsJSON()
  scores!: JsonValue;

  @IsJSON()
  severityLevels!: JsonValue;

  @IsJSON()
  aiEstimate!: JsonValue;
}
