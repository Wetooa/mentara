import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentFileCreateManyInputSchema } from '../inputTypeSchemas/CommentFileCreateManyInputSchema'

export const CommentFileCreateManyAndReturnArgsSchema: z.ZodType<Prisma.CommentFileCreateManyAndReturnArgs> = z.object({
  data: z.union([ CommentFileCreateManyInputSchema,CommentFileCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default CommentFileCreateManyAndReturnArgsSchema;
