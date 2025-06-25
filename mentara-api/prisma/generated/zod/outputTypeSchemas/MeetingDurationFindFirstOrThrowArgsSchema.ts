import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingDurationIncludeSchema } from '../inputTypeSchemas/MeetingDurationIncludeSchema'
import { MeetingDurationWhereInputSchema } from '../inputTypeSchemas/MeetingDurationWhereInputSchema'
import { MeetingDurationOrderByWithRelationInputSchema } from '../inputTypeSchemas/MeetingDurationOrderByWithRelationInputSchema'
import { MeetingDurationWhereUniqueInputSchema } from '../inputTypeSchemas/MeetingDurationWhereUniqueInputSchema'
import { MeetingDurationScalarFieldEnumSchema } from '../inputTypeSchemas/MeetingDurationScalarFieldEnumSchema'
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

export const MeetingDurationFindFirstOrThrowArgsSchema: z.ZodType<Prisma.MeetingDurationFindFirstOrThrowArgs> = z.object({
  select: MeetingDurationSelectSchema.optional(),
  include: z.lazy(() => MeetingDurationIncludeSchema).optional(),
  where: MeetingDurationWhereInputSchema.optional(),
  orderBy: z.union([ MeetingDurationOrderByWithRelationInputSchema.array(),MeetingDurationOrderByWithRelationInputSchema ]).optional(),
  cursor: MeetingDurationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ MeetingDurationScalarFieldEnumSchema,MeetingDurationScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default MeetingDurationFindFirstOrThrowArgsSchema;
