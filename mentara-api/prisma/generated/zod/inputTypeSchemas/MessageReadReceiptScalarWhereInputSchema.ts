import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const MessageReadReceiptScalarWhereInputSchema: z.ZodType<Prisma.MessageReadReceiptScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => MessageReadReceiptScalarWhereInputSchema),z.lazy(() => MessageReadReceiptScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => MessageReadReceiptScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MessageReadReceiptScalarWhereInputSchema),z.lazy(() => MessageReadReceiptScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  messageId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  readAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default MessageReadReceiptScalarWhereInputSchema;
