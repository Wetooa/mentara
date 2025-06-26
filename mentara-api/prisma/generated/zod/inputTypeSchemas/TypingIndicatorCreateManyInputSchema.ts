import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const TypingIndicatorCreateManyInputSchema: z.ZodType<Prisma.TypingIndicatorCreateManyInput> = z.object({
  id: z.string().uuid().optional(),
  conversationId: z.string(),
  userId: z.string(),
  isTyping: z.boolean().optional(),
  lastTypingAt: z.coerce.date().optional()
}).strict();

export default TypingIndicatorCreateManyInputSchema;
