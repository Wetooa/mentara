import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TypingIndicatorWhereUniqueInputSchema } from '../inputTypeSchemas/TypingIndicatorWhereUniqueInputSchema'
import { TypingIndicatorCreateInputSchema } from '../inputTypeSchemas/TypingIndicatorCreateInputSchema'
import { TypingIndicatorUncheckedCreateInputSchema } from '../inputTypeSchemas/TypingIndicatorUncheckedCreateInputSchema'
import { TypingIndicatorUpdateInputSchema } from '../inputTypeSchemas/TypingIndicatorUpdateInputSchema'
import { TypingIndicatorUncheckedUpdateInputSchema } from '../inputTypeSchemas/TypingIndicatorUncheckedUpdateInputSchema'
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const TypingIndicatorSelectSchema: z.ZodType<Prisma.TypingIndicatorSelect> = z.object({
  id: z.boolean().optional(),
  conversationId: z.boolean().optional(),
  userId: z.boolean().optional(),
  isTyping: z.boolean().optional(),
  lastTypingAt: z.boolean().optional(),
}).strict()

export const TypingIndicatorUpsertArgsSchema: z.ZodType<Prisma.TypingIndicatorUpsertArgs> = z.object({
  select: TypingIndicatorSelectSchema.optional(),
  where: TypingIndicatorWhereUniqueInputSchema,
  create: z.union([ TypingIndicatorCreateInputSchema,TypingIndicatorUncheckedCreateInputSchema ]),
  update: z.union([ TypingIndicatorUpdateInputSchema,TypingIndicatorUncheckedUpdateInputSchema ]),
}).strict() ;

export default TypingIndicatorUpsertArgsSchema;
