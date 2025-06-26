import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const MessageReadReceiptCreateManyUserInputSchema: z.ZodType<Prisma.MessageReadReceiptCreateManyUserInput> = z.object({
  id: z.string().uuid().optional(),
  messageId: z.string(),
  readAt: z.coerce.date().optional()
}).strict();

export default MessageReadReceiptCreateManyUserInputSchema;
