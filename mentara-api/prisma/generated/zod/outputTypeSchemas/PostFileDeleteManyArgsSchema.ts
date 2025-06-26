import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostFileWhereInputSchema } from '../inputTypeSchemas/PostFileWhereInputSchema'

export const PostFileDeleteManyArgsSchema: z.ZodType<Prisma.PostFileDeleteManyArgs> = z.object({
  where: PostFileWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default PostFileDeleteManyArgsSchema;
