import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyWhereInputSchema } from '../inputTypeSchemas/ReplyWhereInputSchema'

export const ReplyDeleteManyArgsSchema: z.ZodType<Prisma.ReplyDeleteManyArgs> = z.object({
  where: ReplyWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ReplyDeleteManyArgsSchema;
