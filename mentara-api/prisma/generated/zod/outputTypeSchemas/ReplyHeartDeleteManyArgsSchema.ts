import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyHeartWhereInputSchema } from '../inputTypeSchemas/ReplyHeartWhereInputSchema'

export const ReplyHeartDeleteManyArgsSchema: z.ZodType<Prisma.ReplyHeartDeleteManyArgs> = z.object({
  where: ReplyHeartWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ReplyHeartDeleteManyArgsSchema;
