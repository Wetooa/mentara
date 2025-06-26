import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const MessageReadReceiptUncheckedCreateWithoutMessageInputSchema: z.ZodType<Prisma.MessageReadReceiptUncheckedCreateWithoutMessageInput> = z.object({
  id: z.string().uuid().optional(),
  userId: z.string(),
  readAt: z.coerce.date().optional()
}).strict();

export default MessageReadReceiptUncheckedCreateWithoutMessageInputSchema;
