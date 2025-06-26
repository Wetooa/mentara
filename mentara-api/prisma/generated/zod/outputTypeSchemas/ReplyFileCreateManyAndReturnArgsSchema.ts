import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyFileCreateManyInputSchema } from '../inputTypeSchemas/ReplyFileCreateManyInputSchema'

export const ReplyFileCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ReplyFileCreateManyAndReturnArgs> = z.object({
  data: z.union([ ReplyFileCreateManyInputSchema,ReplyFileCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ReplyFileCreateManyAndReturnArgsSchema;
