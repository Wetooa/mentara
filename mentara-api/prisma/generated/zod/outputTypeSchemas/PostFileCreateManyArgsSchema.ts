import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostFileCreateManyInputSchema } from '../inputTypeSchemas/PostFileCreateManyInputSchema'

export const PostFileCreateManyArgsSchema: z.ZodType<Prisma.PostFileCreateManyArgs> = z.object({
  data: z.union([ PostFileCreateManyInputSchema,PostFileCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default PostFileCreateManyArgsSchema;
