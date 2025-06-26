import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingStatusSchema } from './MeetingStatusSchema';

export const MeetingCreateManyClientInputSchema: z.ZodType<Prisma.MeetingCreateManyClientInput> = z.object({
  id: z.string().uuid().optional(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  startTime: z.coerce.date(),
  duration: z.number().int().optional(),
  status: z.lazy(() => MeetingStatusSchema).optional(),
  meetingType: z.string().optional(),
  meetingUrl: z.string().optional().nullable(),
  therapistId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default MeetingCreateManyClientInputSchema;
