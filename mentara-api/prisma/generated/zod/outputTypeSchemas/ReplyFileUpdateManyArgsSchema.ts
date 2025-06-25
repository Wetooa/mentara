import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyFileUpdateManyMutationInputSchema } from '../inputTypeSchemas/ReplyFileUpdateManyMutationInputSchema'
import { ReplyFileUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/ReplyFileUncheckedUpdateManyInputSchema'
import { ReplyFileWhereInputSchema } from '../inputTypeSchemas/ReplyFileWhereInputSchema'

export const ReplyFileUpdateManyArgsSchema: z.ZodType<Prisma.ReplyFileUpdateManyArgs> = z.object({
  data: z.union([ ReplyFileUpdateManyMutationInputSchema,ReplyFileUncheckedUpdateManyInputSchema ]),
  where: ReplyFileWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ReplyFileUpdateManyArgsSchema;
