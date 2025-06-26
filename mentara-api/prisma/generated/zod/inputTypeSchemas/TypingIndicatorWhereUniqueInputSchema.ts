import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TypingIndicatorConversationIdUserIdCompoundUniqueInputSchema } from './TypingIndicatorConversationIdUserIdCompoundUniqueInputSchema';
import { TypingIndicatorWhereInputSchema } from './TypingIndicatorWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const TypingIndicatorWhereUniqueInputSchema: z.ZodType<Prisma.TypingIndicatorWhereUniqueInput> = z.union([
  z.object({
    id: z.string().uuid(),
    conversationId_userId: z.lazy(() => TypingIndicatorConversationIdUserIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().uuid(),
  }),
  z.object({
    conversationId_userId: z.lazy(() => TypingIndicatorConversationIdUserIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().uuid().optional(),
  conversationId_userId: z.lazy(() => TypingIndicatorConversationIdUserIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => TypingIndicatorWhereInputSchema),z.lazy(() => TypingIndicatorWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TypingIndicatorWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TypingIndicatorWhereInputSchema),z.lazy(() => TypingIndicatorWhereInputSchema).array() ]).optional(),
  conversationId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isTyping: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  lastTypingAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict());

export default TypingIndicatorWhereUniqueInputSchema;
