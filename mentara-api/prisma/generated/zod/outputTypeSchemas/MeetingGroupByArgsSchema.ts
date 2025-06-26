import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingWhereInputSchema } from '../inputTypeSchemas/MeetingWhereInputSchema'
import { MeetingOrderByWithAggregationInputSchema } from '../inputTypeSchemas/MeetingOrderByWithAggregationInputSchema'
import { MeetingScalarFieldEnumSchema } from '../inputTypeSchemas/MeetingScalarFieldEnumSchema'
import { MeetingScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/MeetingScalarWhereWithAggregatesInputSchema'

export const MeetingGroupByArgsSchema: z.ZodType<Prisma.MeetingGroupByArgs> = z.object({
  where: MeetingWhereInputSchema.optional(),
  orderBy: z.union([ MeetingOrderByWithAggregationInputSchema.array(),MeetingOrderByWithAggregationInputSchema ]).optional(),
  by: MeetingScalarFieldEnumSchema.array(),
  having: MeetingScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default MeetingGroupByArgsSchema;
