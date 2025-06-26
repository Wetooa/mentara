import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const MessageReadReceiptCreateManyInputSchema: z.ZodType<Prisma.MessageReadReceiptCreateManyInput> = z.object({
  id: z.string().uuid().optional(),
  messageId: z.string(),
  userId: z.string(),
  readAt: z.coerce.date().optional()
}).strict();

export default MessageReadReceiptCreateManyInputSchema;
