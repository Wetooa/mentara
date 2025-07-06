// Core interfaces and base classes
export * from './interfaces/domain-event.interface';
export * from './event-bus.service';

// Domain Events
export * from './user-events';
export * from './booking-events';
export * from './messaging-events';
export * from './assessment-events';
export * from './social-events';
export * from './billing-events';
export * from './system-events';

// Event type unions for better type safety
export type UserEventType =
  | 'UserRegisteredEvent'
  | 'UserLoginEvent'
  | 'UserLogoutEvent'
  | 'UserProfileUpdatedEvent'
  | 'UserDeactivatedEvent'
  | 'UserReactivatedEvent';

export type BookingEventType =
  | 'AppointmentBookedEvent'
  | 'AppointmentCancelledEvent'
  | 'AppointmentReminderEvent'
  | 'SessionStartedEvent'
  | 'SessionEndedEvent'
  | 'SessionCompletedEvent'
  | 'TherapistAssignedEvent'
  | 'TherapistUnassignedEvent';

export type MessagingEventType =
  | 'MessageSentEvent'
  | 'ConversationCreatedEvent'
  | 'ConversationArchivedEvent'
  | 'TypingIndicatorEvent'
  | 'MessageReadEvent'
  | 'MessageDeliveredEvent'
  | 'ParticipantJoinedEvent'
  | 'ParticipantLeftEvent';

export type AssessmentEventType =
  | 'PreAssessmentStartedEvent'
  | 'PreAssessmentCompletedEvent'
  | 'WorksheetAssignedEvent'
  | 'WorksheetSubmittedEvent'
  | 'WorksheetReviewedEvent'
  | 'ProgressNoteCreatedEvent'
  | 'TreatmentPlanUpdatedEvent'
  | 'MilestoneAchievedEvent';

export type SocialEventType =
  | 'PostCreatedEvent'
  | 'CommentAddedEvent'
  | 'PostLikedEvent'
  | 'PostUnlikedEvent'
  | 'CommunityJoinedEvent'
  | 'CommunityLeftEvent'
  | 'PostReportedEvent'
  | 'PostModerationEvent'
  | 'FollowUserEvent'
  | 'UnfollowUserEvent';

export type BillingEventType =
  | 'PaymentProcessedEvent'
  | 'PaymentFailedEvent'
  | 'RefundProcessedEvent'
  | 'InvoiceGeneratedEvent'
  | 'SubscriptionCreatedEvent'
  | 'SubscriptionCancelledEvent'
  | 'TherapistPayoutEvent'
  | 'InsuranceClaimEvent'
  | 'BillingReminderEvent';

export type SystemEventType =
  | 'SystemErrorEvent'
  | 'AuditLogEvent'
  | 'SecurityIncidentEvent'
  | 'BackupCompletedEvent'
  | 'SystemMaintenanceEvent'
  | 'ConfigurationChangedEvent'
  | 'AdminActionEvent'
  | 'DataExportRequestEvent'
  | 'PerformanceAlertEvent'
  | 'NotificationDeliveredEvent';

export type AllEventTypes =
  | UserEventType
  | BookingEventType
  | MessagingEventType
  | AssessmentEventType
  | SocialEventType
  | BillingEventType
  | SystemEventType;

// Event categories for easier filtering
export const EVENT_CATEGORIES = {
  USER: [
    'UserRegisteredEvent',
    'UserLoginEvent',
    'UserLogoutEvent',
    'UserProfileUpdatedEvent',
    'UserDeactivatedEvent',
    'UserReactivatedEvent',
  ],
  BOOKING: [
    'AppointmentBookedEvent',
    'AppointmentCancelledEvent',
    'AppointmentReminderEvent',
    'SessionStartedEvent',
    'SessionEndedEvent',
    'SessionCompletedEvent',
    'TherapistAssignedEvent',
    'TherapistUnassignedEvent',
  ],
  MESSAGING: [
    'MessageSentEvent',
    'ConversationCreatedEvent',
    'ConversationArchivedEvent',
    'TypingIndicatorEvent',
    'MessageReadEvent',
    'MessageDeliveredEvent',
    'ParticipantJoinedEvent',
    'ParticipantLeftEvent',
  ],
  ASSESSMENT: [
    'PreAssessmentStartedEvent',
    'PreAssessmentCompletedEvent',
    'WorksheetAssignedEvent',
    'WorksheetSubmittedEvent',
    'WorksheetReviewedEvent',
    'ProgressNoteCreatedEvent',
    'TreatmentPlanUpdatedEvent',
    'MilestoneAchievedEvent',
  ],
  SOCIAL: [
    'PostCreatedEvent',
    'CommentAddedEvent',
    'PostLikedEvent',
    'PostUnlikedEvent',
    'CommunityJoinedEvent',
    'CommunityLeftEvent',
    'PostReportedEvent',
    'PostModerationEvent',
    'FollowUserEvent',
    'UnfollowUserEvent',
  ],
  BILLING: [
    'PaymentProcessedEvent',
    'PaymentFailedEvent',
    'RefundProcessedEvent',
    'InvoiceGeneratedEvent',
    'SubscriptionCreatedEvent',
    'SubscriptionCancelledEvent',
    'TherapistPayoutEvent',
    'InsuranceClaimEvent',
    'BillingReminderEvent',
  ],
  SYSTEM: [
    'SystemErrorEvent',
    'AuditLogEvent',
    'SecurityIncidentEvent',
    'BackupCompletedEvent',
    'SystemMaintenanceEvent',
    'ConfigurationChangedEvent',
    'AdminActionEvent',
    'DataExportRequestEvent',
    'PerformanceAlertEvent',
    'NotificationDeliveredEvent',
  ],
} as const;
