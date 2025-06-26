import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentFileWhereInputSchema } from '../inputTypeSchemas/CommentFileWhereInputSchema'
import { CommentFileOrderByWithAggregationInputSchema } from '../inputTypeSchemas/CommentFileOrderByWithAggregationInputSchema'
import { CommentFileScalarFieldEnumSchema } from '../inputTypeSchemas/CommentFileScalarFieldEnumSchema'
import { CommentFileScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/CommentFileScalarWhereWithAggregatesInputSchema'

export const CommentFileGroupByArgsSchema: z.ZodType<Prisma.CommentFileGroupByArgs> = z.object({
  where: CommentFileWhereInputSchema.optional(),
  orderBy: z.union([ CommentFileOrderByWithAggregationInputSchema.array(),CommentFileOrderByWithAggregationInputSchema ]).optional(),
  by: CommentFileScalarFieldEnumSchema.array(),
  having: CommentFileScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default CommentFileGroupByArgsSchema;
