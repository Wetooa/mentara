import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentHeartWhereInputSchema } from '../inputTypeSchemas/CommentHeartWhereInputSchema'

export const CommentHeartDeleteManyArgsSchema: z.ZodType<Prisma.CommentHeartDeleteManyArgs> = z.object({
  where: CommentHeartWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default CommentHeartDeleteManyArgsSchema;
