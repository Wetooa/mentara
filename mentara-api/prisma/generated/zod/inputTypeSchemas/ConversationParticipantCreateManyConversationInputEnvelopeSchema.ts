import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationParticipantCreateManyConversationInputSchema } from './ConversationParticipantCreateManyConversationInputSchema';

export const ConversationParticipantCreateManyConversationInputEnvelopeSchema: z.ZodType<Prisma.ConversationParticipantCreateManyConversationInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ConversationParticipantCreateManyConversationInputSchema),z.lazy(() => ConversationParticipantCreateManyConversationInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default ConversationParticipantCreateManyConversationInputEnvelopeSchema;
