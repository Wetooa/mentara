import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyUpdateManyMutationInputSchema } from '../inputTypeSchemas/ReplyUpdateManyMutationInputSchema'
import { ReplyUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/ReplyUncheckedUpdateManyInputSchema'
import { ReplyWhereInputSchema } from '../inputTypeSchemas/ReplyWhereInputSchema'

export const ReplyUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.ReplyUpdateManyAndReturnArgs> = z.object({
  data: z.union([ ReplyUpdateManyMutationInputSchema,ReplyUncheckedUpdateManyInputSchema ]),
  where: ReplyWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ReplyUpdateManyAndReturnArgsSchema;
