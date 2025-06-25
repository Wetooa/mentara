import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PostFileUpdateManyMutationInputSchema } from '../inputTypeSchemas/PostFileUpdateManyMutationInputSchema'
import { PostFileUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/PostFileUncheckedUpdateManyInputSchema'
import { PostFileWhereInputSchema } from '../inputTypeSchemas/PostFileWhereInputSchema'

export const PostFileUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.PostFileUpdateManyAndReturnArgs> = z.object({
  data: z.union([ PostFileUpdateManyMutationInputSchema,PostFileUncheckedUpdateManyInputSchema ]),
  where: PostFileWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default PostFileUpdateManyAndReturnArgsSchema;
