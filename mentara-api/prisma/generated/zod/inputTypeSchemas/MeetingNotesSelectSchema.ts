import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingArgsSchema } from "../outputTypeSchemas/MeetingArgsSchema"

export const MeetingNotesSelectSchema: z.ZodType<Prisma.MeetingNotesSelect> = z.object({
  id: z.boolean().optional(),
  meetingId: z.boolean().optional(),
  notes: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  meeting: z.union([z.boolean(),z.lazy(() => MeetingArgsSchema)]).optional(),
}).strict()

export default MeetingNotesSelectSchema;
