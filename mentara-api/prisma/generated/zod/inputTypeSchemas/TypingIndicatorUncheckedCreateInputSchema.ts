import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const TypingIndicatorUncheckedCreateInputSchema: z.ZodType<Prisma.TypingIndicatorUncheckedCreateInput> = z.object({
  id: z.string().uuid().optional(),
  conversationId: z.string(),
  userId: z.string(),
  isTyping: z.boolean().optional(),
  lastTypingAt: z.coerce.date().optional()
}).strict();

export default TypingIndicatorUncheckedCreateInputSchema;
