import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostFileUpdateManyMutationInputSchema } from '../inputTypeSchemas/PostFileUpdateManyMutationInputSchema'
import { PostFileUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/PostFileUncheckedUpdateManyInputSchema'
import { PostFileWhereInputSchema } from '../inputTypeSchemas/PostFileWhereInputSchema'

export const PostFileUpdateManyArgsSchema: z.ZodType<Prisma.PostFileUpdateManyArgs> = z.object({
  data: z.union([ PostFileUpdateManyMutationInputSchema,PostFileUncheckedUpdateManyInputSchema ]),
  where: PostFileWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default PostFileUpdateManyArgsSchema;
