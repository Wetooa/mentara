import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const MessageReactionCreateManyInputSchema: z.ZodType<Prisma.MessageReactionCreateManyInput> = z.object({
  id: z.string().uuid().optional(),
  messageId: z.string(),
  userId: z.string(),
  emoji: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export default MessageReactionCreateManyInputSchema;
