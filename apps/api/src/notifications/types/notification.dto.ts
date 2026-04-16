import { NotificationType, NotificationPriority } from '@prisma/client';

export interface NotificationQuery {
  isRead?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  data?: any;
  actionUrl?: string;
  userId: string;
}

export interface UpdateNotificationSettingsDto {
  emailAppointmentReminders?: boolean;
  emailNewMessages?: boolean;
  emailWorksheetUpdates?: boolean;
  emailSystemUpdates?: boolean;
  emailMarketing?: boolean;
  pushAppointmentReminders?: boolean;
  pushNewMessages?: boolean;
  pushWorksheetUpdates?: boolean;
  pushSystemUpdates?: boolean;
  inAppMessages?: boolean;
  inAppUpdates?: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  quietHoursTimezone?: string;
}