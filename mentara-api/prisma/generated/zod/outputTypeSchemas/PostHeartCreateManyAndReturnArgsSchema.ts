import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostHeartCreateManyInputSchema } from '../inputTypeSchemas/PostHeartCreateManyInputSchema'

export const PostHeartCreateManyAndReturnArgsSchema: z.ZodType<Prisma.PostHeartCreateManyAndReturnArgs> = z.object({
  data: z.union([ PostHeartCreateManyInputSchema,PostHeartCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default PostHeartCreateManyAndReturnArgsSchema;
