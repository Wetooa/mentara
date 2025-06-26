import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingStatusSchema } from './MeetingStatusSchema';
import { MeetingNotesCreateNestedManyWithoutMeetingInputSchema } from './MeetingNotesCreateNestedManyWithoutMeetingInputSchema';
import { TherapistCreateNestedOneWithoutMeetingsInputSchema } from './TherapistCreateNestedOneWithoutMeetingsInputSchema';
import { ReviewCreateNestedManyWithoutMeetingInputSchema } from './ReviewCreateNestedManyWithoutMeetingInputSchema';

export const MeetingCreateWithoutClientInputSchema: z.ZodType<Prisma.MeetingCreateWithoutClientInput> = z.object({
  id: z.string().uuid().optional(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  startTime: z.coerce.date(),
  duration: z.number().int().optional(),
  status: z.lazy(() => MeetingStatusSchema).optional(),
  meetingType: z.string().optional(),
  meetingUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  meetingNotes: z.lazy(() => MeetingNotesCreateNestedManyWithoutMeetingInputSchema).optional(),
  therapist: z.lazy(() => TherapistCreateNestedOneWithoutMeetingsInputSchema),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutMeetingInputSchema).optional()
}).strict();

export default MeetingCreateWithoutClientInputSchema;
