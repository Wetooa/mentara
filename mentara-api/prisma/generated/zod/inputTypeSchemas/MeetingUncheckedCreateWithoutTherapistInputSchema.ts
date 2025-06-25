import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingStatusSchema } from './MeetingStatusSchema';

export const MeetingUncheckedCreateWithoutTherapistInputSchema: z.ZodType<Prisma.MeetingUncheckedCreateWithoutTherapistInput> = z.object({
  id: z.string().uuid().optional(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  duration: z.number().int(),
  status: z.lazy(() => MeetingStatusSchema).optional(),
  meetingType: z.string().optional(),
  meetingUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  clientId: z.string(),
  durationId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default MeetingUncheckedCreateWithoutTherapistInputSchema;
