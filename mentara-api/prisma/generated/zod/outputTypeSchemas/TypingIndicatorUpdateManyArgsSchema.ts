import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TypingIndicatorUpdateManyMutationInputSchema } from '../inputTypeSchemas/TypingIndicatorUpdateManyMutationInputSchema'
import { TypingIndicatorUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/TypingIndicatorUncheckedUpdateManyInputSchema'
import { TypingIndicatorWhereInputSchema } from '../inputTypeSchemas/TypingIndicatorWhereInputSchema'

export const TypingIndicatorUpdateManyArgsSchema: z.ZodType<Prisma.TypingIndicatorUpdateManyArgs> = z.object({
  data: z.union([ TypingIndicatorUpdateManyMutationInputSchema,TypingIndicatorUncheckedUpdateManyInputSchema ]),
  where: TypingIndicatorWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default TypingIndicatorUpdateManyArgsSchema;
