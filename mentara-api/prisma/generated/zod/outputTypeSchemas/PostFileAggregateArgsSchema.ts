import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostFileWhereInputSchema } from '../inputTypeSchemas/PostFileWhereInputSchema'
import { PostFileOrderByWithRelationInputSchema } from '../inputTypeSchemas/PostFileOrderByWithRelationInputSchema'
import { PostFileWhereUniqueInputSchema } from '../inputTypeSchemas/PostFileWhereUniqueInputSchema'

export const PostFileAggregateArgsSchema: z.ZodType<Prisma.PostFileAggregateArgs> = z.object({
  where: PostFileWhereInputSchema.optional(),
  orderBy: z.union([ PostFileOrderByWithRelationInputSchema.array(),PostFileOrderByWithRelationInputSchema ]).optional(),
  cursor: PostFileWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default PostFileAggregateArgsSchema;
