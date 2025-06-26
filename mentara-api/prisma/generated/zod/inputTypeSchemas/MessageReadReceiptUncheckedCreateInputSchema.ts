import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const MessageReadReceiptUncheckedCreateInputSchema: z.ZodType<Prisma.MessageReadReceiptUncheckedCreateInput> = z.object({
  id: z.string().uuid().optional(),
  messageId: z.string(),
  userId: z.string(),
  readAt: z.coerce.date().optional()
}).strict();

export default MessageReadReceiptUncheckedCreateInputSchema;
