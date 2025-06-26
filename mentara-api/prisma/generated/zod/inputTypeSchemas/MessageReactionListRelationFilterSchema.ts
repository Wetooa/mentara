import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReactionWhereInputSchema } from './MessageReactionWhereInputSchema';

export const MessageReactionListRelationFilterSchema: z.ZodType<Prisma.MessageReactionListRelationFilter> = z.object({
  every: z.lazy(() => MessageReactionWhereInputSchema).optional(),
  some: z.lazy(() => MessageReactionWhereInputSchema).optional(),
  none: z.lazy(() => MessageReactionWhereInputSchema).optional()
}).strict();

export default MessageReactionListRelationFilterSchema;
