import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingStatusSchema } from './MeetingStatusSchema';
import { ReviewUncheckedCreateNestedManyWithoutMeetingInputSchema } from './ReviewUncheckedCreateNestedManyWithoutMeetingInputSchema';

export const MeetingUncheckedCreateWithoutMeetingNotesInputSchema: z.ZodType<Prisma.MeetingUncheckedCreateWithoutMeetingNotesInput> = z.object({
  id: z.string().uuid().optional(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  startTime: z.coerce.date(),
  duration: z.number().int().optional(),
  status: z.lazy(() => MeetingStatusSchema).optional(),
  meetingType: z.string().optional(),
  meetingUrl: z.string().optional().nullable(),
  clientId: z.string(),
  therapistId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutMeetingInputSchema).optional()
}).strict();

export default MeetingUncheckedCreateWithoutMeetingNotesInputSchema;
