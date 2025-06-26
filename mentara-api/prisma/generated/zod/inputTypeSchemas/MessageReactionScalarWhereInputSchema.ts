import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const MessageReactionScalarWhereInputSchema: z.ZodType<Prisma.MessageReactionScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => MessageReactionScalarWhereInputSchema),z.lazy(() => MessageReactionScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => MessageReactionScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MessageReactionScalarWhereInputSchema),z.lazy(() => MessageReactionScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  messageId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  emoji: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default MessageReactionScalarWhereInputSchema;
