import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostFileWhereInputSchema } from '../inputTypeSchemas/PostFileWhereInputSchema'
import { PostFileOrderByWithAggregationInputSchema } from '../inputTypeSchemas/PostFileOrderByWithAggregationInputSchema'
import { PostFileScalarFieldEnumSchema } from '../inputTypeSchemas/PostFileScalarFieldEnumSchema'
import { PostFileScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/PostFileScalarWhereWithAggregatesInputSchema'

export const PostFileGroupByArgsSchema: z.ZodType<Prisma.PostFileGroupByArgs> = z.object({
  where: PostFileWhereInputSchema.optional(),
  orderBy: z.union([ PostFileOrderByWithAggregationInputSchema.array(),PostFileOrderByWithAggregationInputSchema ]).optional(),
  by: PostFileScalarFieldEnumSchema.array(),
  having: PostFileScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default PostFileGroupByArgsSchema;
