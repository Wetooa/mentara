import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentFileWhereInputSchema } from '../inputTypeSchemas/CommentFileWhereInputSchema'

export const CommentFileDeleteManyArgsSchema: z.ZodType<Prisma.CommentFileDeleteManyArgs> = z.object({
  where: CommentFileWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default CommentFileDeleteManyArgsSchema;
