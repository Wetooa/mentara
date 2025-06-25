import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentHeartWhereInputSchema } from '../inputTypeSchemas/CommentHeartWhereInputSchema'
import { CommentHeartOrderByWithRelationInputSchema } from '../inputTypeSchemas/CommentHeartOrderByWithRelationInputSchema'
import { CommentHeartWhereUniqueInputSchema } from '../inputTypeSchemas/CommentHeartWhereUniqueInputSchema'

export const CommentHeartAggregateArgsSchema: z.ZodType<Prisma.CommentHeartAggregateArgs> = z.object({
  where: CommentHeartWhereInputSchema.optional(),
  orderBy: z.union([ CommentHeartOrderByWithRelationInputSchema.array(),CommentHeartOrderByWithRelationInputSchema ]).optional(),
  cursor: CommentHeartWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default CommentHeartAggregateArgsSchema;
