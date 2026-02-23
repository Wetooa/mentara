import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type PreAssessmentMethod = 'CHECKLIST' | 'CHATBOT' | 'HYBRID';

export class QuestionnaireScore {
  @ApiProperty()
  score!: number;

  @ApiProperty()
  severity!: string;
}

export class QuestionnaireScores {
  [key: string]: QuestionnaireScore;
}

export class PreAssessmentDocuments {
  @ApiPropertyOptional({ type: String, nullable: true })
  soapAnalysisUrl!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  conversationHistoryUrl!: string | null;
}

export class PreAssessmentData {
  @ApiProperty({ type: 'object', additionalProperties: { $ref: '#/components/schemas/QuestionnaireScore' } })
  questionnaireScores!: QuestionnaireScores;

  @ApiPropertyOptional({ type: PreAssessmentDocuments })
  documents?: PreAssessmentDocuments;
}

export class CreatePreAssessmentDto {
  @ApiPropertyOptional({ type: String, nullable: true })
  assessmentId!: string | null;

  @ApiProperty({ enum: ['CHECKLIST', 'CHATBOT', 'HYBRID'] })
  method!: PreAssessmentMethod;

  @ApiProperty({ type: 'string', format: 'date-time' })
  completedAt!: string | Date;

  @ApiProperty({ type: PreAssessmentData })
  data!: PreAssessmentData;

  @ApiPropertyOptional({ type: String, nullable: true })
  pastTherapyExperiences!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  medicationHistory!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  accessibilityNeeds!: string | null;
}

export class UpdatePreAssessmentDto {
  @ApiPropertyOptional({ type: String, nullable: true })
  assessmentId!: string | null;

  @ApiProperty({ enum: ['CHECKLIST', 'CHATBOT', 'HYBRID'] })
  method!: PreAssessmentMethod;

  @ApiProperty({ type: 'string', format: 'date-time' })
  completedAt!: string | Date;

  @ApiProperty({ type: PreAssessmentData })
  data!: PreAssessmentData;

  @ApiPropertyOptional({ type: String, nullable: true })
  pastTherapyExperiences!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  medicationHistory!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  accessibilityNeeds!: string | null;
}

export class AurisChatDto {
  @ApiProperty()
  sessionId!: string;

  @ApiProperty()
  message!: string;
}

export class AurisResponseDto {
  @ApiProperty()
  response!: string;

  @ApiProperty()
  state!: {
    is_complete: boolean;
    [key: string]: any;
  };

  @ApiPropertyOptional()
  results?: {
    assessmentId: string;
    method: PreAssessmentMethod;
    completedAt: string;
    data: PreAssessmentData;
    context: {
      pastTherapyExperiences: string[];
      medicationHistory: string[];
      accessibilityNeeds: string[];
    };
  };
}

export class PreAssessmentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  message!: string;
}
