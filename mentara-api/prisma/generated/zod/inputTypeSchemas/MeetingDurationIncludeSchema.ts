import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingFindManyArgsSchema } from "../outputTypeSchemas/MeetingFindManyArgsSchema"
import { MeetingDurationCountOutputTypeArgsSchema } from "../outputTypeSchemas/MeetingDurationCountOutputTypeArgsSchema"

export const MeetingDurationIncludeSchema: z.ZodType<Prisma.MeetingDurationInclude> = z.object({
  meetings: z.union([z.boolean(),z.lazy(() => MeetingFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => MeetingDurationCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default MeetingDurationIncludeSchema;
