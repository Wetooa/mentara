import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostHeartCreateManyInputSchema } from '../inputTypeSchemas/PostHeartCreateManyInputSchema'

export const PostHeartCreateManyArgsSchema: z.ZodType<Prisma.PostHeartCreateManyArgs> = z.object({
  data: z.union([ PostHeartCreateManyInputSchema,PostHeartCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default PostHeartCreateManyArgsSchema;
