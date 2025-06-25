import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyHeartWhereInputSchema } from '../inputTypeSchemas/ReplyHeartWhereInputSchema'
import { ReplyHeartOrderByWithAggregationInputSchema } from '../inputTypeSchemas/ReplyHeartOrderByWithAggregationInputSchema'
import { ReplyHeartScalarFieldEnumSchema } from '../inputTypeSchemas/ReplyHeartScalarFieldEnumSchema'
import { ReplyHeartScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/ReplyHeartScalarWhereWithAggregatesInputSchema'

export const ReplyHeartGroupByArgsSchema: z.ZodType<Prisma.ReplyHeartGroupByArgs> = z.object({
  where: ReplyHeartWhereInputSchema.optional(),
  orderBy: z.union([ ReplyHeartOrderByWithAggregationInputSchema.array(),ReplyHeartOrderByWithAggregationInputSchema ]).optional(),
  by: ReplyHeartScalarFieldEnumSchema.array(),
  having: ReplyHeartScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ReplyHeartGroupByArgsSchema;
