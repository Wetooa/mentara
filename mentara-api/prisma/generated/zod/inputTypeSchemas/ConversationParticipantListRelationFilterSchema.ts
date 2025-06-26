import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationParticipantWhereInputSchema } from './ConversationParticipantWhereInputSchema';

export const ConversationParticipantListRelationFilterSchema: z.ZodType<Prisma.ConversationParticipantListRelationFilter> = z.object({
  every: z.lazy(() => ConversationParticipantWhereInputSchema).optional(),
  some: z.lazy(() => ConversationParticipantWhereInputSchema).optional(),
  none: z.lazy(() => ConversationParticipantWhereInputSchema).optional()
}).strict();

export default ConversationParticipantListRelationFilterSchema;
