import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyFileWhereInputSchema } from '../inputTypeSchemas/ReplyFileWhereInputSchema'

export const ReplyFileDeleteManyArgsSchema: z.ZodType<Prisma.ReplyFileDeleteManyArgs> = z.object({
  where: ReplyFileWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ReplyFileDeleteManyArgsSchema;
