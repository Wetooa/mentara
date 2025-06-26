import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReadReceiptMessageIdUserIdCompoundUniqueInputSchema } from './MessageReadReceiptMessageIdUserIdCompoundUniqueInputSchema';
import { MessageReadReceiptWhereInputSchema } from './MessageReadReceiptWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { MessageScalarRelationFilterSchema } from './MessageScalarRelationFilterSchema';
import { MessageWhereInputSchema } from './MessageWhereInputSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const MessageReadReceiptWhereUniqueInputSchema: z.ZodType<Prisma.MessageReadReceiptWhereUniqueInput> = z.union([
  z.object({
    id: z.string().uuid(),
    messageId_userId: z.lazy(() => MessageReadReceiptMessageIdUserIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().uuid(),
  }),
  z.object({
    messageId_userId: z.lazy(() => MessageReadReceiptMessageIdUserIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().uuid().optional(),
  messageId_userId: z.lazy(() => MessageReadReceiptMessageIdUserIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => MessageReadReceiptWhereInputSchema),z.lazy(() => MessageReadReceiptWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => MessageReadReceiptWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MessageReadReceiptWhereInputSchema),z.lazy(() => MessageReadReceiptWhereInputSchema).array() ]).optional(),
  messageId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  readAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  message: z.union([ z.lazy(() => MessageScalarRelationFilterSchema),z.lazy(() => MessageWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export default MessageReadReceiptWhereUniqueInputSchema;
