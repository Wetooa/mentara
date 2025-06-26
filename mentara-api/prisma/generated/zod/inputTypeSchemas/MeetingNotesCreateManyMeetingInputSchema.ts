import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const MeetingNotesCreateManyMeetingInputSchema: z.ZodType<Prisma.MeetingNotesCreateManyMeetingInput> = z.object({
  id: z.string(),
  notes: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default MeetingNotesCreateManyMeetingInputSchema;
