import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReactionMessageIdUserIdEmojiCompoundUniqueInputSchema } from './MessageReactionMessageIdUserIdEmojiCompoundUniqueInputSchema';
import { MessageReactionWhereInputSchema } from './MessageReactionWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { MessageScalarRelationFilterSchema } from './MessageScalarRelationFilterSchema';
import { MessageWhereInputSchema } from './MessageWhereInputSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const MessageReactionWhereUniqueInputSchema: z.ZodType<Prisma.MessageReactionWhereUniqueInput> = z.union([
  z.object({
    id: z.string().uuid(),
    messageId_userId_emoji: z.lazy(() => MessageReactionMessageIdUserIdEmojiCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().uuid(),
  }),
  z.object({
    messageId_userId_emoji: z.lazy(() => MessageReactionMessageIdUserIdEmojiCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().uuid().optional(),
  messageId_userId_emoji: z.lazy(() => MessageReactionMessageIdUserIdEmojiCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => MessageReactionWhereInputSchema),z.lazy(() => MessageReactionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => MessageReactionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MessageReactionWhereInputSchema),z.lazy(() => MessageReactionWhereInputSchema).array() ]).optional(),
  messageId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  emoji: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  message: z.union([ z.lazy(() => MessageScalarRelationFilterSchema),z.lazy(() => MessageWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export default MessageReactionWhereUniqueInputSchema;
