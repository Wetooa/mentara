import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TypingIndicatorWhereInputSchema } from '../inputTypeSchemas/TypingIndicatorWhereInputSchema'

export const TypingIndicatorDeleteManyArgsSchema: z.ZodType<Prisma.TypingIndicatorDeleteManyArgs> = z.object({
  where: TypingIndicatorWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default TypingIndicatorDeleteManyArgsSchema;
