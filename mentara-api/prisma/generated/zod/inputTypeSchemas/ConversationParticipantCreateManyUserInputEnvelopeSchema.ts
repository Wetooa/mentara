import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationParticipantCreateManyUserInputSchema } from './ConversationParticipantCreateManyUserInputSchema';

export const ConversationParticipantCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.ConversationParticipantCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ConversationParticipantCreateManyUserInputSchema),z.lazy(() => ConversationParticipantCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default ConversationParticipantCreateManyUserInputEnvelopeSchema;
