import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostHeartWhereInputSchema } from '../inputTypeSchemas/PostHeartWhereInputSchema'
import { PostHeartOrderByWithRelationInputSchema } from '../inputTypeSchemas/PostHeartOrderByWithRelationInputSchema'
import { PostHeartWhereUniqueInputSchema } from '../inputTypeSchemas/PostHeartWhereUniqueInputSchema'

export const PostHeartAggregateArgsSchema: z.ZodType<Prisma.PostHeartAggregateArgs> = z.object({
  where: PostHeartWhereInputSchema.optional(),
  orderBy: z.union([ PostHeartOrderByWithRelationInputSchema.array(),PostHeartOrderByWithRelationInputSchema ]).optional(),
  cursor: PostHeartWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default PostHeartAggregateArgsSchema;
