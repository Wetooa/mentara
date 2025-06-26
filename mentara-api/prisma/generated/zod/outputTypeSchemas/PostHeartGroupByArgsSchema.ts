import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostHeartWhereInputSchema } from '../inputTypeSchemas/PostHeartWhereInputSchema'
import { PostHeartOrderByWithAggregationInputSchema } from '../inputTypeSchemas/PostHeartOrderByWithAggregationInputSchema'
import { PostHeartScalarFieldEnumSchema } from '../inputTypeSchemas/PostHeartScalarFieldEnumSchema'
import { PostHeartScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/PostHeartScalarWhereWithAggregatesInputSchema'

export const PostHeartGroupByArgsSchema: z.ZodType<Prisma.PostHeartGroupByArgs> = z.object({
  where: PostHeartWhereInputSchema.optional(),
  orderBy: z.union([ PostHeartOrderByWithAggregationInputSchema.array(),PostHeartOrderByWithAggregationInputSchema ]).optional(),
  by: PostHeartScalarFieldEnumSchema.array(),
  having: PostHeartScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default PostHeartGroupByArgsSchema;
