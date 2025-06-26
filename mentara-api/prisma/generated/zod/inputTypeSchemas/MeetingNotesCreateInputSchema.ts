import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingCreateNestedOneWithoutMeetingNotesInputSchema } from './MeetingCreateNestedOneWithoutMeetingNotesInputSchema';

export const MeetingNotesCreateInputSchema: z.ZodType<Prisma.MeetingNotesCreateInput> = z.object({
  id: z.string(),
  notes: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  meeting: z.lazy(() => MeetingCreateNestedOneWithoutMeetingNotesInputSchema)
}).strict();

export default MeetingNotesCreateInputSchema;
