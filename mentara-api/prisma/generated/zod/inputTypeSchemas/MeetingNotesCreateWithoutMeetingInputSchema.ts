import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const MeetingNotesCreateWithoutMeetingInputSchema: z.ZodType<Prisma.MeetingNotesCreateWithoutMeetingInput> = z.object({
  id: z.string(),
  notes: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default MeetingNotesCreateWithoutMeetingInputSchema;
