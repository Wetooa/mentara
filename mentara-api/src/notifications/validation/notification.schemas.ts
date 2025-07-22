import { z } from 'zod';
import { NotificationType, NotificationPriority } from '@prisma/client';

export const NotificationQuerySchema = z.object({
  isRead: z.coerce.boolean().optional(),
  type: z.nativeEnum(NotificationType).optional(),
  priority: z.nativeEnum(NotificationPriority).optional(),
});

export const CreateNotificationDtoSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  message: z.string().min(1, "Message is required").max(1000, "Message must be less than 1000 characters"),
  type: z.nativeEnum(NotificationType),
  priority: z.nativeEnum(NotificationPriority).optional(),
  data: z.any().optional(),
  actionUrl: z.string().url().optional(),
  userId: z.string().min(1, "User ID is required"),
});

export const UpdateNotificationSettingsDtoSchema = z.object({
  emailAppointmentReminders: z.boolean().optional(),
  emailNewMessages: z.boolean().optional(),
  emailWorksheetUpdates: z.boolean().optional(),
  emailSystemUpdates: z.boolean().optional(),
  emailMarketing: z.boolean().optional(),
  pushAppointmentReminders: z.boolean().optional(),
  pushNewMessages: z.boolean().optional(),
  pushWorksheetUpdates: z.boolean().optional(),
  pushSystemUpdates: z.boolean().optional(),
  inAppMessages: z.boolean().optional(),
  inAppUpdates: z.boolean().optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format").optional(),
  quietHoursEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format").optional(),
  quietHoursTimezone: z.string().optional(),
});