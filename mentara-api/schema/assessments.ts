import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsArray,
  IsDateString,
  IsDecimal,
  Min,
  Max,
} from 'class-validator';

export enum AssessmentStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
  EXPIRED = 'EXPIRED',
}

export enum QuestionnaireCategory {
  DEPRESSION = 'DEPRESSION',
  ANXIETY = 'ANXIETY',
  STRESS = 'STRESS',
  TRAUMA_PTSD = 'TRAUMA_PTSD',
  SUBSTANCE_USE = 'SUBSTANCE_USE',
  EATING_DISORDERS = 'EATING_DISORDERS',
  SLEEP_DISORDERS = 'SLEEP_DISORDERS',
  ADHD = 'ADHD',
  BIPOLAR = 'BIPOLAR',
  PERSONALITY = 'PERSONALITY',
  SOCIAL_ANXIETY = 'SOCIAL_ANXIETY',
  PANIC_DISORDER = 'PANIC_DISORDER',
  OCD = 'OCD',
  GENERAL_WELLBEING = 'GENERAL_WELLBEING',
}

export enum QuestionType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TEXT_SHORT = 'TEXT_SHORT',
  TEXT_LONG = 'TEXT_LONG',
  NUMERIC = 'NUMERIC',
  SCALE = 'SCALE',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  SLIDER = 'SLIDER',
  RANKING = 'RANKING',
}

export enum ScoringType {
  SUM = 'SUM',
  AVERAGE = 'AVERAGE',
  WEIGHTED = 'WEIGHTED',
  CUSTOM = 'CUSTOM',
}

export enum RiskLevel {
  MINIMAL = 'MINIMAL',
  MILD = 'MILD',
  MODERATE = 'MODERATE',
  MODERATELY_SEVERE = 'MODERATELY_SEVERE',
  SEVERE = 'SEVERE',
  CRITICAL = 'CRITICAL',
}

export enum SeverityLevel {
  NONE = 'NONE',
  MINIMAL = 'MINIMAL',
  MILD = 'MILD',
  MODERATE = 'MODERATE',
  SEVERE = 'SEVERE',
  EXTREME = 'EXTREME',
}

export class AssessmentCreateDto {
  @IsString()
  clientId!: string;
}

export class AssessmentUpdateDto {
  @IsOptional()
  @IsEnum(AssessmentStatus)
  status?: AssessmentStatus;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @IsEnum(RiskLevel)
  overallRisk?: RiskLevel;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  primaryConcerns?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recommendations?: string[];

  @IsOptional()
  @IsDecimal()
  @Min(0)
  @Max(100)
  confidenceScore?: number;
}

export class QuestionnaireCreateDto {
  @IsString()
  name!: string;

  @IsString()
  displayName!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(QuestionnaireCategory)
  category!: QuestionnaireCategory;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  timeLimit?: number;

  @IsEnum(ScoringType)
  scoringType!: ScoringType;

  @IsOptional()
  @IsNumber()
  minScore?: number;

  @IsOptional()
  @IsNumber()
  maxScore?: number;
}

export class QuestionCreateDto {
  @IsString()
  questionnaireId!: string;

  @IsString()
  text!: string;

  @IsEnum(QuestionType)
  questionType!: QuestionType;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsNumber()
  order!: number;

  @IsOptional()
  validation?: any;
}

export class QuestionOptionCreateDto {
  @IsString()
  questionId!: string;

  @IsString()
  text!: string;

  @IsString()
  value!: string;

  @IsNumber()
  order!: number;

  @IsOptional()
  @IsNumber()
  score?: number;
}

export class AnswerCreateDto {
  @IsString()
  assessmentQuestionnaireId!: string;

  @IsString()
  questionId!: string;

  @IsOptional()
  @IsString()
  selectedOptionId?: string;

  @IsOptional()
  @IsString()
  textResponse?: string;

  @IsOptional()
  @IsNumber()
  numericResponse?: number;

  @IsOptional()
  @IsDateString()
  dateResponse?: string;

  @IsOptional()
  @IsBoolean()
  booleanResponse?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  multiSelectResponses?: string[];

  @IsOptional()
  @IsNumber()
  responseTime?: number;

  @IsOptional()
  @IsBoolean()
  wasSkipped?: boolean;
}

export type AssessmentResponse = {
  id: string;
  clientId: string;
  status: AssessmentStatus;
  startedAt: Date;
  completedAt?: Date;
  overallRisk?: RiskLevel;
  primaryConcerns: string[];
  recommendations: string[];
  confidenceScore?: number;
  createdAt: Date;
  updatedAt: Date;
};

export type QuestionnaireResponse = {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  category: QuestionnaireCategory;
  version: string;
  isActive: boolean;
  timeLimit?: number;
  scoringType: ScoringType;
  minScore?: number;
  maxScore?: number;
  createdAt: Date;
  updatedAt: Date;
};

export type QuestionResponse = {
  id: string;
  questionnaireId: string;
  text: string;
  questionType: QuestionType;
  isRequired: boolean;
  order: number;
  validation?: any;
};

export type AnswerResponse = {
  id: string;
  assessmentQuestionnaireId: string;
  questionId: string;
  selectedOptionId?: string;
  textResponse?: string;
  numericResponse?: number;
  dateResponse?: Date;
  booleanResponse?: boolean;
  multiSelectResponses: string[];
  responseTime?: number;
  wasSkipped: boolean;
  createdAt: Date;
  updatedAt: Date;
};