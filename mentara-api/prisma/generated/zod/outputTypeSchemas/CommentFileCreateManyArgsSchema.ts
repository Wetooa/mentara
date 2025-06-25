import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentFileCreateManyInputSchema } from '../inputTypeSchemas/CommentFileCreateManyInputSchema'

export const CommentFileCreateManyArgsSchema: z.ZodType<Prisma.CommentFileCreateManyArgs> = z.object({
  data: z.union([ CommentFileCreateManyInputSchema,CommentFileCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default CommentFileCreateManyArgsSchema;
