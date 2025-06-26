import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingArgsSchema } from "../outputTypeSchemas/MeetingArgsSchema"

export const MeetingNotesIncludeSchema: z.ZodType<Prisma.MeetingNotesInclude> = z.object({
  meeting: z.union([z.boolean(),z.lazy(() => MeetingArgsSchema)]).optional(),
}).strict()

export default MeetingNotesIncludeSchema;
