import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const MeetingNotesUncheckedCreateWithoutMeetingInputSchema: z.ZodType<Prisma.MeetingNotesUncheckedCreateWithoutMeetingInput> = z.object({
  id: z.string(),
  notes: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default MeetingNotesUncheckedCreateWithoutMeetingInputSchema;
