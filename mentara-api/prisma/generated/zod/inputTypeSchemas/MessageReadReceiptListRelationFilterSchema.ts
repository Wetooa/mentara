import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReadReceiptWhereInputSchema } from './MessageReadReceiptWhereInputSchema';

export const MessageReadReceiptListRelationFilterSchema: z.ZodType<Prisma.MessageReadReceiptListRelationFilter> = z.object({
  every: z.lazy(() => MessageReadReceiptWhereInputSchema).optional(),
  some: z.lazy(() => MessageReadReceiptWhereInputSchema).optional(),
  none: z.lazy(() => MessageReadReceiptWhereInputSchema).optional()
}).strict();

export default MessageReadReceiptListRelationFilterSchema;
