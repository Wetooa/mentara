import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const MessageReactionUncheckedCreateWithoutMessageInputSchema: z.ZodType<Prisma.MessageReactionUncheckedCreateWithoutMessageInput> = z.object({
  id: z.string().uuid().optional(),
  userId: z.string(),
  emoji: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export default MessageReactionUncheckedCreateWithoutMessageInputSchema;
