import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TypingIndicatorCreateManyInputSchema } from '../inputTypeSchemas/TypingIndicatorCreateManyInputSchema'

export const TypingIndicatorCreateManyArgsSchema: z.ZodType<Prisma.TypingIndicatorCreateManyArgs> = z.object({
  data: z.union([ TypingIndicatorCreateManyInputSchema,TypingIndicatorCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default TypingIndicatorCreateManyArgsSchema;
