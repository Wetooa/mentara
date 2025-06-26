import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const TypingIndicatorSelectSchema: z.ZodType<Prisma.TypingIndicatorSelect> = z.object({
  id: z.boolean().optional(),
  conversationId: z.boolean().optional(),
  userId: z.boolean().optional(),
  isTyping: z.boolean().optional(),
  lastTypingAt: z.boolean().optional(),
}).strict()

export default TypingIndicatorSelectSchema;
