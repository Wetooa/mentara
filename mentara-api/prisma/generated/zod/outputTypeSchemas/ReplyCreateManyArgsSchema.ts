import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyCreateManyInputSchema } from '../inputTypeSchemas/ReplyCreateManyInputSchema'

export const ReplyCreateManyArgsSchema: z.ZodType<Prisma.ReplyCreateManyArgs> = z.object({
  data: z.union([ ReplyCreateManyInputSchema,ReplyCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ReplyCreateManyArgsSchema;
