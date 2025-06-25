import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostHeartWhereInputSchema } from '../inputTypeSchemas/PostHeartWhereInputSchema'

export const PostHeartDeleteManyArgsSchema: z.ZodType<Prisma.PostHeartDeleteManyArgs> = z.object({
  where: PostHeartWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default PostHeartDeleteManyArgsSchema;
