import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingStatusSchema } from './MeetingStatusSchema';
import { TherapistCreateNestedOneWithoutMeetingsInputSchema } from './TherapistCreateNestedOneWithoutMeetingsInputSchema';
import { MeetingDurationCreateNestedOneWithoutMeetingsInputSchema } from './MeetingDurationCreateNestedOneWithoutMeetingsInputSchema';

export const MeetingCreateWithoutClientInputSchema: z.ZodType<Prisma.MeetingCreateWithoutClientInput> = z.object({
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
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  therapist: z.lazy(() => TherapistCreateNestedOneWithoutMeetingsInputSchema),
  durationConfig: z.lazy(() => MeetingDurationCreateNestedOneWithoutMeetingsInputSchema).optional()
}).strict();

export default MeetingCreateWithoutClientInputSchema;
