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

// ─── Auris State (mirrors Flask microservice response) ────────────────────────

export class AurisStateDto {
  @ApiProperty()
  assessment_phase!: string;

  @ApiProperty()
  completion_reason!: string;

  @ApiProperty()
  total_questions_asked!: number;

  @ApiProperty()
  message_count!: number;

  @ApiProperty()
  is_complete!: boolean;

  @ApiProperty()
  requires_crisis_protocol!: boolean;

  @ApiProperty({ type: 'object', additionalProperties: true })
  extracted_data!: Record<string, unknown>;

  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' } })
  identified_questionnaires!: Record<string, string>;

  @ApiProperty({ type: [String] })
  candidate_scales!: string[];
}

// ─── Auris Results (populated when assessment is complete) ────────────────────

export class AurisResultContextDto {
  @ApiProperty({ type: [String] })
  pastTherapyExperiences!: string[];

  @ApiProperty({ type: [String] })
  medicationHistory!: string[];

  @ApiProperty({ type: [String] })
  accessibilityNeeds!: string[];
}

export class AurisResultDto {
  @ApiProperty()
  assessmentId!: string;

  @ApiProperty({ enum: ['CHECKLIST', 'CHATBOT', 'HYBRID'] })
  method!: PreAssessmentMethod;

  @ApiProperty()
  completedAt!: string;

  @ApiProperty({ type: PreAssessmentData })
  data!: PreAssessmentData;

  @ApiProperty({ type: AurisResultContextDto })
  context!: AurisResultContextDto;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export class AurisResponseDto {
  @ApiProperty()
  response!: string;

  @ApiProperty({ type: AurisStateDto })
  state!: AurisStateDto;

  @ApiPropertyOptional({ type: AurisResultDto })
  results?: AurisResultDto;
}

export class NewSessionResponseDto {
  @ApiProperty()
  session_id!: string;

  @ApiProperty()
  opening_message!: string;
}

export class PreAssessmentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  message!: string;
}

export class PreAssessmentDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ type: String, nullable: true })
  clientId!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  sessionId!: string | null;

  @ApiProperty({ enum: ['CHECKLIST', 'CHATBOT', 'HYBRID'] })
  method!: PreAssessmentMethod;

  @ApiProperty({ type: PreAssessmentData })
  data!: PreAssessmentData;

  @ApiPropertyOptional({ type: String, nullable: true })
  pastTherapyExperiences!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  medicationHistory!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  accessibilityNeeds!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  soapAnalysisUrl!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  conversationHistoryUrl!: string | null;
}
