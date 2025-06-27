import {
  BaseDomainEvent,
  EventMetadata,
} from './interfaces/domain-event.interface';

// Assessment & Progress Events

export interface PreAssessmentStartedData {
  assessmentId: string;
  clientId: string;
  assessmentType: string;
  startedAt: Date;
  estimatedDuration: number; // in minutes
}

export class PreAssessmentStartedEvent extends BaseDomainEvent<PreAssessmentStartedData> {
  constructor(data: PreAssessmentStartedData, metadata?: EventMetadata) {
    super(data.assessmentId, 'PreAssessment', data, metadata);
  }
}

export interface PreAssessmentCompletedData {
  assessmentId: string;
  clientId: string;
  completedAt: Date;
  actualDuration: number; // in minutes
  scores: Record<string, number>;
  severityLevels: Record<string, string>;
  aiEstimate: Record<string, any>;
  recommendedTherapistSpecialties: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export class PreAssessmentCompletedEvent extends BaseDomainEvent<PreAssessmentCompletedData> {
  constructor(data: PreAssessmentCompletedData, metadata?: EventMetadata) {
    super(data.assessmentId, 'PreAssessment', data, metadata);
  }
}

export interface WorksheetAssignedData {
  worksheetId: string;
  clientId: string;
  therapistId: string;
  worksheetType: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number; // in minutes
}

export class WorksheetAssignedEvent extends BaseDomainEvent<WorksheetAssignedData> {
  constructor(data: WorksheetAssignedData, metadata?: EventMetadata) {
    super(data.worksheetId, 'Worksheet', data, metadata);
  }
}

export interface WorksheetSubmittedData {
  worksheetId: string;
  submissionId: string;
  clientId: string;
  therapistId: string;
  submittedAt: Date;
  timeSpent: number; // in minutes
  responses: Record<string, any>;
  attachments?: string[]; // file IDs
  clientNotes?: string;
  completionStatus: 'complete' | 'partial' | 'skipped';
}

export class WorksheetSubmittedEvent extends BaseDomainEvent<WorksheetSubmittedData> {
  constructor(data: WorksheetSubmittedData, metadata?: EventMetadata) {
    super(data.worksheetId, 'Worksheet', data, metadata);
  }
}

export interface WorksheetReviewedData {
  worksheetId: string;
  submissionId: string;
  clientId: string;
  therapistId: string;
  reviewedAt: Date;
  feedback: string;
  rating?: number; // 1-5
  followUpRequired: boolean;
  nextSteps?: string;
  reviewStatus: 'approved' | 'needs_revision' | 'incomplete';
}

export class WorksheetReviewedEvent extends BaseDomainEvent<WorksheetReviewedData> {
  constructor(data: WorksheetReviewedData, metadata?: EventMetadata) {
    super(data.worksheetId, 'Worksheet', data, metadata);
  }
}

export interface ProgressNoteCreatedData {
  noteId: string;
  clientId: string;
  therapistId: string;
  sessionId?: string;
  noteType:
    | 'session_note'
    | 'progress_update'
    | 'treatment_plan'
    | 'assessment_note';
  content: string;
  tags: string[];
  isPrivate: boolean;
  createdAt: Date;
}

export class ProgressNoteCreatedEvent extends BaseDomainEvent<ProgressNoteCreatedData> {
  constructor(data: ProgressNoteCreatedData, metadata?: EventMetadata) {
    super(data.noteId, 'ProgressNote', data, metadata);
  }
}

export interface TreatmentPlanUpdatedData {
  planId: string;
  clientId: string;
  therapistId: string;
  updatedSections: string[];
  goals: string[];
  interventions: string[];
  timeline: string;
  updatedAt: Date;
  version: number;
  changeReason: string;
}

export class TreatmentPlanUpdatedEvent extends BaseDomainEvent<TreatmentPlanUpdatedData> {
  constructor(data: TreatmentPlanUpdatedData, metadata?: EventMetadata) {
    super(data.planId, 'TreatmentPlan', data, metadata);
  }
}

export interface MilestoneAchievedData {
  milestoneId: string;
  clientId: string;
  therapistId: string;
  milestoneType: string;
  description: string;
  achievedAt: Date;
  relatedGoals: string[];
  celebrationSent: boolean;
}

export class MilestoneAchievedEvent extends BaseDomainEvent<MilestoneAchievedData> {
  constructor(data: MilestoneAchievedData, metadata?: EventMetadata) {
    super(data.milestoneId, 'Milestone', data, metadata);
  }
}
