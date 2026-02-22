import { z } from 'zod';

export const PlatformAnalyticsQueryDtoSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  includeDetails: z.coerce.boolean().optional(),
});

export const TherapistAnalyticsQueryDtoSchema = z.object({
  therapistId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  includeDetails: z.coerce.boolean().optional(),
});

export const ClientAnalyticsQueryDtoSchema = z.object({
  clientId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  includeDetails: z.coerce.boolean().optional(),
});