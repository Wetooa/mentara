import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MessageReadReceiptSelectSchema } from '../inputTypeSchemas/MessageReadReceiptSelectSchema';
import { MessageReadReceiptIncludeSchema } from '../inputTypeSchemas/MessageReadReceiptIncludeSchema';

export const MessageReadReceiptArgsSchema: z.ZodType<Prisma.MessageReadReceiptDefaultArgs> = z.object({
  select: z.lazy(() => MessageReadReceiptSelectSchema).optional(),
  include: z.lazy(() => MessageReadReceiptIncludeSchema).optional(),
}).strict();

export default MessageReadReceiptArgsSchema;
