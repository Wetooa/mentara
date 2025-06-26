import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingStatusSchema } from './MeetingStatusSchema';
import { ClientCreateNestedOneWithoutMeetingsInputSchema } from './ClientCreateNestedOneWithoutMeetingsInputSchema';
import { MeetingDurationCreateNestedOneWithoutMeetingsInputSchema } from './MeetingDurationCreateNestedOneWithoutMeetingsInputSchema';
import { ReviewCreateNestedManyWithoutMeetingInputSchema } from './ReviewCreateNestedManyWithoutMeetingInputSchema';

export const MeetingCreateWithoutTherapistInputSchema: z.ZodType<Prisma.MeetingCreateWithoutTherapistInput> = z.object({
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
  client: z.lazy(() => ClientCreateNestedOneWithoutMeetingsInputSchema),
  durationConfig: z.lazy(() => MeetingDurationCreateNestedOneWithoutMeetingsInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutMeetingInputSchema).optional()
}).strict();

export default MeetingCreateWithoutTherapistInputSchema;
