import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingDurationIncludeSchema } from '../inputTypeSchemas/MeetingDurationIncludeSchema'
import { MeetingDurationUpdateInputSchema } from '../inputTypeSchemas/MeetingDurationUpdateInputSchema'
import { MeetingDurationUncheckedUpdateInputSchema } from '../inputTypeSchemas/MeetingDurationUncheckedUpdateInputSchema'
import { MeetingDurationWhereUniqueInputSchema } from '../inputTypeSchemas/MeetingDurationWhereUniqueInputSchema'
import { MeetingFindManyArgsSchema } from "../outputTypeSchemas/MeetingFindManyArgsSchema"
import { MeetingDurationCountOutputTypeArgsSchema } from "../outputTypeSchemas/MeetingDurationCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

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

export const MeetingDurationUpdateArgsSchema: z.ZodType<Prisma.MeetingDurationUpdateArgs> = z.object({
  select: MeetingDurationSelectSchema.optional(),
  include: z.lazy(() => MeetingDurationIncludeSchema).optional(),
  data: z.union([ MeetingDurationUpdateInputSchema,MeetingDurationUncheckedUpdateInputSchema ]),
  where: MeetingDurationWhereUniqueInputSchema,
}).strict() ;

export default MeetingDurationUpdateArgsSchema;
