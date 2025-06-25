import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyWhereInputSchema } from '../inputTypeSchemas/ReplyWhereInputSchema'
import { ReplyOrderByWithAggregationInputSchema } from '../inputTypeSchemas/ReplyOrderByWithAggregationInputSchema'
import { ReplyScalarFieldEnumSchema } from '../inputTypeSchemas/ReplyScalarFieldEnumSchema'
import { ReplyScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/ReplyScalarWhereWithAggregatesInputSchema'

export const ReplyGroupByArgsSchema: z.ZodType<Prisma.ReplyGroupByArgs> = z.object({
  where: ReplyWhereInputSchema.optional(),
  orderBy: z.union([ ReplyOrderByWithAggregationInputSchema.array(),ReplyOrderByWithAggregationInputSchema ]).optional(),
  by: ReplyScalarFieldEnumSchema.array(),
  having: ReplyScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ReplyGroupByArgsSchema;
