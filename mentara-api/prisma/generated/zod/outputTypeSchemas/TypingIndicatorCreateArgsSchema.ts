import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TypingIndicatorCreateInputSchema } from '../inputTypeSchemas/TypingIndicatorCreateInputSchema'
import { TypingIndicatorUncheckedCreateInputSchema } from '../inputTypeSchemas/TypingIndicatorUncheckedCreateInputSchema'
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const TypingIndicatorSelectSchema: z.ZodType<Prisma.TypingIndicatorSelect> = z.object({
  id: z.boolean().optional(),
  conversationId: z.boolean().optional(),
  userId: z.boolean().optional(),
  isTyping: z.boolean().optional(),
  lastTypingAt: z.boolean().optional(),
}).strict()

export const TypingIndicatorCreateArgsSchema: z.ZodType<Prisma.TypingIndicatorCreateArgs> = z.object({
  select: TypingIndicatorSelectSchema.optional(),
  data: z.union([ TypingIndicatorCreateInputSchema,TypingIndicatorUncheckedCreateInputSchema ]),
}).strict() ;

export default TypingIndicatorCreateArgsSchema;
