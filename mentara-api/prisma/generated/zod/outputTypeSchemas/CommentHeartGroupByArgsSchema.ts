import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentHeartWhereInputSchema } from '../inputTypeSchemas/CommentHeartWhereInputSchema'
import { CommentHeartOrderByWithAggregationInputSchema } from '../inputTypeSchemas/CommentHeartOrderByWithAggregationInputSchema'
import { CommentHeartScalarFieldEnumSchema } from '../inputTypeSchemas/CommentHeartScalarFieldEnumSchema'
import { CommentHeartScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/CommentHeartScalarWhereWithAggregatesInputSchema'

export const CommentHeartGroupByArgsSchema: z.ZodType<Prisma.CommentHeartGroupByArgs> = z.object({
  where: CommentHeartWhereInputSchema.optional(),
  orderBy: z.union([ CommentHeartOrderByWithAggregationInputSchema.array(),CommentHeartOrderByWithAggregationInputSchema ]).optional(),
  by: CommentHeartScalarFieldEnumSchema.array(),
  having: CommentHeartScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default CommentHeartGroupByArgsSchema;
