import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const MessageReactionCreateManyUserInputSchema: z.ZodType<Prisma.MessageReactionCreateManyUserInput> = z.object({
  id: z.string().uuid().optional(),
  messageId: z.string(),
  emoji: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export default MessageReactionCreateManyUserInputSchema;
