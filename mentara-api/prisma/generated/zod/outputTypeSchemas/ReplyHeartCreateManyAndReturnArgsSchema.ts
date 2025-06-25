import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyHeartCreateManyInputSchema } from '../inputTypeSchemas/ReplyHeartCreateManyInputSchema'

export const ReplyHeartCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ReplyHeartCreateManyAndReturnArgs> = z.object({
  data: z.union([ ReplyHeartCreateManyInputSchema,ReplyHeartCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ReplyHeartCreateManyAndReturnArgsSchema;
