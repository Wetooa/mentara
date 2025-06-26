import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationWhereInputSchema } from './ConversationWhereInputSchema';

export const ConversationScalarRelationFilterSchema: z.ZodType<Prisma.ConversationScalarRelationFilter> = z.object({
  is: z.lazy(() => ConversationWhereInputSchema).optional(),
  isNot: z.lazy(() => ConversationWhereInputSchema).optional()
}).strict();

export default ConversationScalarRelationFilterSchema;
