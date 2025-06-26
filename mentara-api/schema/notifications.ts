import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsJSON,
  IsUrl,
} from 'class-validator';

export enum NotificationType {
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  APPOINTMENT_CONFIRMED = 'APPOINTMENT_CONFIRMED',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  APPOINTMENT_RESCHEDULED = 'APPOINTMENT_RESCHEDULED',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  MESSAGE_REACTION = 'MESSAGE_REACTION',
  WORKSHEET_ASSIGNED = 'WORKSHEET_ASSIGNED',
  WORKSHEET_DUE = 'WORKSHEET_DUE',
  WORKSHEET_FEEDBACK = 'WORKSHEET_FEEDBACK',
  REVIEW_REQUEST = 'REVIEW_REQUEST',
  REVIEW_RECEIVED = 'REVIEW_RECEIVED',
  THERAPIST_APPLICATION = 'THERAPIST_APPLICATION',
  THERAPIST_APPROVED = 'THERAPIST_APPROVED',
  THERAPIST_REJECTED = 'THERAPIST_REJECTED',
  COMMUNITY_POST = 'COMMUNITY_POST',
  COMMUNITY_REPLY = 'COMMUNITY_REPLY',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  SYSTEM_UPDATE = 'SYSTEM_UPDATE',
  SECURITY_ALERT = 'SECURITY_ALERT',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SUBSCRIPTION_EXPIRING = 'SUBSCRIPTION_EXPIRING',
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class NotificationCreateDto {
  @IsString()
  userId!: string;

  @IsString()
  title!: string;

  @IsString()
  message!: string;

  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsJSON()
  data?: any;

  @IsOptional()
  @IsUrl()
  actionUrl?: string;

  @IsOptional()
  @IsDateString()
  scheduledFor?: string;
}

export class NotificationUpdateDto {
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsDateString()
  readAt?: string;
}

export class NotificationSettingsCreateDto {
  @IsString()
  userId!: string;

  @IsOptional()
  @IsBoolean()
  emailAppointmentReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  emailNewMessages?: boolean;

  @IsOptional()
  @IsBoolean()
  emailWorksheetUpdates?: boolean;

  @IsOptional()
  @IsBoolean()
  emailSystemUpdates?: boolean;

  @IsOptional()
  @IsBoolean()
  emailMarketing?: boolean;

  @IsOptional()
  @IsBoolean()
  pushAppointmentReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  pushNewMessages?: boolean;

  @IsOptional()
  @IsBoolean()
  pushWorksheetUpdates?: boolean;

  @IsOptional()
  @IsBoolean()
  pushSystemUpdates?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppMessages?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppUpdates?: boolean;

  @IsOptional()
  @IsBoolean()
  quietHoursEnabled?: boolean;

  @IsOptional()
  @IsString()
  quietHoursStart?: string;

  @IsOptional()
  @IsString()
  quietHoursEnd?: string;

  @IsOptional()
  @IsString()
  quietHoursTimezone?: string;
}

export class NotificationSettingsUpdateDto extends NotificationSettingsCreateDto {}

export type NotificationResponse = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  data?: any;
  actionUrl?: string;
  isRead: boolean;
  readAt?: Date;
  scheduledFor?: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type NotificationSettingsResponse = {
  id: string;
  userId: string;
  emailAppointmentReminders: boolean;
  emailNewMessages: boolean;
  emailWorksheetUpdates: boolean;
  emailSystemUpdates: boolean;
  emailMarketing: boolean;
  pushAppointmentReminders: boolean;
  pushNewMessages: boolean;
  pushWorksheetUpdates: boolean;
  pushSystemUpdates: boolean;
  inAppMessages: boolean;
  inAppUpdates: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  quietHoursTimezone?: string;
  createdAt: Date;
  updatedAt: Date;
};