import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyFileWhereInputSchema } from '../inputTypeSchemas/ReplyFileWhereInputSchema'
import { ReplyFileOrderByWithAggregationInputSchema } from '../inputTypeSchemas/ReplyFileOrderByWithAggregationInputSchema'
import { ReplyFileScalarFieldEnumSchema } from '../inputTypeSchemas/ReplyFileScalarFieldEnumSchema'
import { ReplyFileScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/ReplyFileScalarWhereWithAggregatesInputSchema'

export const ReplyFileGroupByArgsSchema: z.ZodType<Prisma.ReplyFileGroupByArgs> = z.object({
  where: ReplyFileWhereInputSchema.optional(),
  orderBy: z.union([ ReplyFileOrderByWithAggregationInputSchema.array(),ReplyFileOrderByWithAggregationInputSchema ]).optional(),
  by: ReplyFileScalarFieldEnumSchema.array(),
  having: ReplyFileScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ReplyFileGroupByArgsSchema;
