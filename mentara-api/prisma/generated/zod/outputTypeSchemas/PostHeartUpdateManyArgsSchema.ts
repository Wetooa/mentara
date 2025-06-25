import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostHeartUpdateManyMutationInputSchema } from '../inputTypeSchemas/PostHeartUpdateManyMutationInputSchema'
import { PostHeartUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/PostHeartUncheckedUpdateManyInputSchema'
import { PostHeartWhereInputSchema } from '../inputTypeSchemas/PostHeartWhereInputSchema'

export const PostHeartUpdateManyArgsSchema: z.ZodType<Prisma.PostHeartUpdateManyArgs> = z.object({
  data: z.union([ PostHeartUpdateManyMutationInputSchema,PostHeartUncheckedUpdateManyInputSchema ]),
  where: PostHeartWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default PostHeartUpdateManyArgsSchema;
