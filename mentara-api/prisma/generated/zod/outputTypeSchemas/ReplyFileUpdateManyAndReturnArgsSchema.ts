import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyFileUpdateManyMutationInputSchema } from '../inputTypeSchemas/ReplyFileUpdateManyMutationInputSchema'
import { ReplyFileUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/ReplyFileUncheckedUpdateManyInputSchema'
import { ReplyFileWhereInputSchema } from '../inputTypeSchemas/ReplyFileWhereInputSchema'

export const ReplyFileUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.ReplyFileUpdateManyAndReturnArgs> = z.object({
  data: z.union([ ReplyFileUpdateManyMutationInputSchema,ReplyFileUncheckedUpdateManyInputSchema ]),
  where: ReplyFileWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ReplyFileUpdateManyAndReturnArgsSchema;
