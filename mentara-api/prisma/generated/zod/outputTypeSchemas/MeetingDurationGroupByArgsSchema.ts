import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingDurationWhereInputSchema } from '../inputTypeSchemas/MeetingDurationWhereInputSchema'
import { MeetingDurationOrderByWithAggregationInputSchema } from '../inputTypeSchemas/MeetingDurationOrderByWithAggregationInputSchema'
import { MeetingDurationScalarFieldEnumSchema } from '../inputTypeSchemas/MeetingDurationScalarFieldEnumSchema'
import { MeetingDurationScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/MeetingDurationScalarWhereWithAggregatesInputSchema'

export const MeetingDurationGroupByArgsSchema: z.ZodType<Prisma.MeetingDurationGroupByArgs> = z.object({
  where: MeetingDurationWhereInputSchema.optional(),
  orderBy: z.union([ MeetingDurationOrderByWithAggregationInputSchema.array(),MeetingDurationOrderByWithAggregationInputSchema ]).optional(),
  by: MeetingDurationScalarFieldEnumSchema.array(),
  having: MeetingDurationScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default MeetingDurationGroupByArgsSchema;
