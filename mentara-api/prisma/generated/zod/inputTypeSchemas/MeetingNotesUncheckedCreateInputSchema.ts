import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const MeetingNotesUncheckedCreateInputSchema: z.ZodType<Prisma.MeetingNotesUncheckedCreateInput> = z.object({
  id: z.string(),
  meetingId: z.string(),
  notes: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default MeetingNotesUncheckedCreateInputSchema;
