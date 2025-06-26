import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { ConversationParticipantCountOrderByAggregateInputSchema } from './ConversationParticipantCountOrderByAggregateInputSchema';
import { ConversationParticipantMaxOrderByAggregateInputSchema } from './ConversationParticipantMaxOrderByAggregateInputSchema';
import { ConversationParticipantMinOrderByAggregateInputSchema } from './ConversationParticipantMinOrderByAggregateInputSchema';

export const ConversationParticipantOrderByWithAggregationInputSchema: z.ZodType<Prisma.ConversationParticipantOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  conversationId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  joinedAt: z.lazy(() => SortOrderSchema).optional(),
  lastReadAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  isMuted: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ConversationParticipantCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ConversationParticipantMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ConversationParticipantMinOrderByAggregateInputSchema).optional()
}).strict();

export default ConversationParticipantOrderByWithAggregationInputSchema;
