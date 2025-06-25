import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingFindManyArgsSchema } from "../outputTypeSchemas/MeetingFindManyArgsSchema"
import { MeetingDurationCountOutputTypeArgsSchema } from "../outputTypeSchemas/MeetingDurationCountOutputTypeArgsSchema"

export const MeetingDurationSelectSchema: z.ZodType<Prisma.MeetingDurationSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  duration: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  meetings: z.union([z.boolean(),z.lazy(() => MeetingFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => MeetingDurationCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default MeetingDurationSelectSchema;
