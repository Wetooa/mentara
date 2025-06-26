import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TypingIndicatorUpdateInputSchema } from '../inputTypeSchemas/TypingIndicatorUpdateInputSchema'
import { TypingIndicatorUncheckedUpdateInputSchema } from '../inputTypeSchemas/TypingIndicatorUncheckedUpdateInputSchema'
import { TypingIndicatorWhereUniqueInputSchema } from '../inputTypeSchemas/TypingIndicatorWhereUniqueInputSchema'
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const TypingIndicatorSelectSchema: z.ZodType<Prisma.TypingIndicatorSelect> = z.object({
  id: z.boolean().optional(),
  conversationId: z.boolean().optional(),
  userId: z.boolean().optional(),
  isTyping: z.boolean().optional(),
  lastTypingAt: z.boolean().optional(),
}).strict()

export const TypingIndicatorUpdateArgsSchema: z.ZodType<Prisma.TypingIndicatorUpdateArgs> = z.object({
  select: TypingIndicatorSelectSchema.optional(),
  data: z.union([ TypingIndicatorUpdateInputSchema,TypingIndicatorUncheckedUpdateInputSchema ]),
  where: TypingIndicatorWhereUniqueInputSchema,
}).strict() ;

export default TypingIndicatorUpdateArgsSchema;
