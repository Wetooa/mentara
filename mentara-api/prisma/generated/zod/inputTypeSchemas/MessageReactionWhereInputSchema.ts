import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { MessageScalarRelationFilterSchema } from './MessageScalarRelationFilterSchema';
import { MessageWhereInputSchema } from './MessageWhereInputSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const MessageReactionWhereInputSchema: z.ZodType<Prisma.MessageReactionWhereInput> = z.object({
  AND: z.union([ z.lazy(() => MessageReactionWhereInputSchema),z.lazy(() => MessageReactionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => MessageReactionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MessageReactionWhereInputSchema),z.lazy(() => MessageReactionWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  messageId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  emoji: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  message: z.union([ z.lazy(() => MessageScalarRelationFilterSchema),z.lazy(() => MessageWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export default MessageReactionWhereInputSchema;
