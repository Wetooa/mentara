import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommentFileUpdateManyMutationInputSchema } from '../inputTypeSchemas/CommentFileUpdateManyMutationInputSchema'
import { CommentFileUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/CommentFileUncheckedUpdateManyInputSchema'
import { CommentFileWhereInputSchema } from '../inputTypeSchemas/CommentFileWhereInputSchema'

export const CommentFileUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.CommentFileUpdateManyAndReturnArgs> = z.object({
  data: z.union([ CommentFileUpdateManyMutationInputSchema,CommentFileUncheckedUpdateManyInputSchema ]),
  where: CommentFileWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default CommentFileUpdateManyAndReturnArgsSchema;
