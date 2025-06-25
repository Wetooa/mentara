import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostFileCreateManyInputSchema } from '../inputTypeSchemas/PostFileCreateManyInputSchema'

export const PostFileCreateManyAndReturnArgsSchema: z.ZodType<Prisma.PostFileCreateManyAndReturnArgs> = z.object({
  data: z.union([ PostFileCreateManyInputSchema,PostFileCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default PostFileCreateManyAndReturnArgsSchema;
