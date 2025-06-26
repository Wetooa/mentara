import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentHeartCreateManyInputSchema } from '../inputTypeSchemas/CommentHeartCreateManyInputSchema'

export const CommentHeartCreateManyArgsSchema: z.ZodType<Prisma.CommentHeartCreateManyArgs> = z.object({
  data: z.union([ CommentHeartCreateManyInputSchema,CommentHeartCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default CommentHeartCreateManyArgsSchema;
