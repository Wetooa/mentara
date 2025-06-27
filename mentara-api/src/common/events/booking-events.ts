import {
  BaseDomainEvent,
  EventMetadata,
} from './interfaces/domain-event.interface';

// Booking & Therapy Events

export interface AppointmentBookedData {
  appointmentId: string;
  clientId: string;
  therapistId: string;
  startTime: Date;
  duration: number; // in minutes
  meetingType: 'video' | 'audio' | 'in_person' | 'chat';
  title?: string;
  description?: string;
  isInitialConsultation: boolean;
}

export class AppointmentBookedEvent extends BaseDomainEvent<AppointmentBookedData> {
  constructor(data: AppointmentBookedData, metadata?: EventMetadata) {
    super(data.appointmentId, 'Appointment', data, metadata);
  }
}

export interface AppointmentCancelledData {
  appointmentId: string;
  clientId: string;
  therapistId: string;
  cancelledBy: string; // userId
  cancellationReason: string;
  cancelledAt: Date;
  originalStartTime: Date;
  cancellationNotice: number; // hours before appointment
}

export class AppointmentCancelledEvent extends BaseDomainEvent<AppointmentCancelledData> {
  constructor(data: AppointmentCancelledData, metadata?: EventMetadata) {
    super(data.appointmentId, 'Appointment', data, metadata);
  }
}

export interface AppointmentReminderData {
  appointmentId: string;
  clientId: string;
  therapistId: string;
  startTime: Date;
  reminderType: '24h' | '1h' | '15min';
  deliveryMethod: 'email' | 'sms' | 'push' | 'in_app';
}

export class AppointmentReminderEvent extends BaseDomainEvent<AppointmentReminderData> {
  constructor(data: AppointmentReminderData, metadata?: EventMetadata) {
    super(data.appointmentId, 'Appointment', data, metadata);
  }
}

export interface SessionStartedData {
  sessionId: string;
  appointmentId: string;
  clientId: string;
  therapistId: string;
  sessionType: 'individual' | 'group' | 'consultation';
  platform: string;
  actualStartTime: Date;
  scheduledStartTime: Date;
}

export class SessionStartedEvent extends BaseDomainEvent<SessionStartedData> {
  constructor(data: SessionStartedData, metadata?: EventMetadata) {
    super(data.sessionId, 'Session', data, metadata);
  }
}

export interface SessionEndedData {
  sessionId: string;
  appointmentId: string;
  clientId: string;
  therapistId: string;
  endTime: Date;
  actualDuration: number; // in minutes
  scheduledDuration: number; // in minutes
  endReason: 'completed' | 'technical_issue' | 'no_show' | 'cancelled';
}

export class SessionEndedEvent extends BaseDomainEvent<SessionEndedData> {
  constructor(data: SessionEndedData, metadata?: EventMetadata) {
    super(data.sessionId, 'Session', data, metadata);
  }
}

export interface SessionCompletedData {
  sessionId: string;
  appointmentId: string;
  clientId: string;
  therapistId: string;
  completedAt: Date;
  sessionNotes?: string;
  nextSteps?: string;
  followUpRequired: boolean;
  sessionRating?: number; // 1-5
}

export class SessionCompletedEvent extends BaseDomainEvent<SessionCompletedData> {
  constructor(data: SessionCompletedData, metadata?: EventMetadata) {
    super(data.sessionId, 'Session', data, metadata);
  }
}

export interface TherapistAssignedData {
  clientId: string;
  therapistId: string;
  assignedBy: string; // userId of admin or system
  assignmentReason:
    | 'manual'
    | 'recommendation'
    | 'availability'
    | 'specialty_match';
  effectiveDate: Date;
}

export class TherapistAssignedEvent extends BaseDomainEvent<TherapistAssignedData> {
  constructor(data: TherapistAssignedData, metadata?: EventMetadata) {
    super(
      `${data.clientId}_${data.therapistId}`,
      'ClientTherapist',
      data,
      metadata,
    );
  }
}

export interface TherapistUnassignedData {
  clientId: string;
  therapistId: string;
  unassignedBy: string;
  unassignmentReason: string;
  relationshipDuration: number; // in days
  sessionCount: number;
}

export class TherapistUnassignedEvent extends BaseDomainEvent<TherapistUnassignedData> {
  constructor(data: TherapistUnassignedData, metadata?: EventMetadata) {
    super(
      `${data.clientId}_${data.therapistId}`,
      'ClientTherapist',
      data,
      metadata,
    );
  }
}
