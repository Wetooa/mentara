import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyFileCreateManyInputSchema } from '../inputTypeSchemas/ReplyFileCreateManyInputSchema'

export const ReplyFileCreateManyArgsSchema: z.ZodType<Prisma.ReplyFileCreateManyArgs> = z.object({
  data: z.union([ ReplyFileCreateManyInputSchema,ReplyFileCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ReplyFileCreateManyArgsSchema;
