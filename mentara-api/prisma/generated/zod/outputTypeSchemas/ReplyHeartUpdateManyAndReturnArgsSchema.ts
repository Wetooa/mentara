import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyHeartUpdateManyMutationInputSchema } from '../inputTypeSchemas/ReplyHeartUpdateManyMutationInputSchema'
import { ReplyHeartUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/ReplyHeartUncheckedUpdateManyInputSchema'
import { ReplyHeartWhereInputSchema } from '../inputTypeSchemas/ReplyHeartWhereInputSchema'

export const ReplyHeartUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.ReplyHeartUpdateManyAndReturnArgs> = z.object({
  data: z.union([ ReplyHeartUpdateManyMutationInputSchema,ReplyHeartUncheckedUpdateManyInputSchema ]),
  where: ReplyHeartWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ReplyHeartUpdateManyAndReturnArgsSchema;
