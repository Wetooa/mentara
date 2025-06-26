import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const MessageReadReceiptMessageIdUserIdCompoundUniqueInputSchema: z.ZodType<Prisma.MessageReadReceiptMessageIdUserIdCompoundUniqueInput> = z.object({
  messageId: z.string(),
  userId: z.string()
}).strict();

export default MessageReadReceiptMessageIdUserIdCompoundUniqueInputSchema;
