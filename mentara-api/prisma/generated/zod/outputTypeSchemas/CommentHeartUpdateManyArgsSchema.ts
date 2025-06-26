import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentHeartUpdateManyMutationInputSchema } from '../inputTypeSchemas/CommentHeartUpdateManyMutationInputSchema'
import { CommentHeartUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/CommentHeartUncheckedUpdateManyInputSchema'
import { CommentHeartWhereInputSchema } from '../inputTypeSchemas/CommentHeartWhereInputSchema'

export const CommentHeartUpdateManyArgsSchema: z.ZodType<Prisma.CommentHeartUpdateManyArgs> = z.object({
  data: z.union([ CommentHeartUpdateManyMutationInputSchema,CommentHeartUncheckedUpdateManyInputSchema ]),
  where: CommentHeartWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default CommentHeartUpdateManyArgsSchema;
