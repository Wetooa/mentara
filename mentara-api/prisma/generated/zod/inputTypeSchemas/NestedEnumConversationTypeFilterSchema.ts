import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationTypeSchema } from './ConversationTypeSchema';

export const NestedEnumConversationTypeFilterSchema: z.ZodType<Prisma.NestedEnumConversationTypeFilter> = z.object({
  equals: z.lazy(() => ConversationTypeSchema).optional(),
  in: z.lazy(() => ConversationTypeSchema).array().optional(),
  notIn: z.lazy(() => ConversationTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => ConversationTypeSchema),z.lazy(() => NestedEnumConversationTypeFilterSchema) ]).optional(),
}).strict();

export default NestedEnumConversationTypeFilterSchema;
