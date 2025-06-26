import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingNotesSelectSchema } from '../inputTypeSchemas/MeetingNotesSelectSchema';
import { MeetingNotesIncludeSchema } from '../inputTypeSchemas/MeetingNotesIncludeSchema';

export const MeetingNotesArgsSchema: z.ZodType<Prisma.MeetingNotesDefaultArgs> = z.object({
  select: z.lazy(() => MeetingNotesSelectSchema).optional(),
  include: z.lazy(() => MeetingNotesIncludeSchema).optional(),
}).strict();

export default MeetingNotesArgsSchema;
