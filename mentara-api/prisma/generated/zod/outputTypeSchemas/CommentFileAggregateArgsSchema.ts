import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentFileWhereInputSchema } from '../inputTypeSchemas/CommentFileWhereInputSchema'
import { CommentFileOrderByWithRelationInputSchema } from '../inputTypeSchemas/CommentFileOrderByWithRelationInputSchema'
import { CommentFileWhereUniqueInputSchema } from '../inputTypeSchemas/CommentFileWhereUniqueInputSchema'

export const CommentFileAggregateArgsSchema: z.ZodType<Prisma.CommentFileAggregateArgs> = z.object({
  where: CommentFileWhereInputSchema.optional(),
  orderBy: z.union([ CommentFileOrderByWithRelationInputSchema.array(),CommentFileOrderByWithRelationInputSchema ]).optional(),
  cursor: CommentFileWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default CommentFileAggregateArgsSchema;
